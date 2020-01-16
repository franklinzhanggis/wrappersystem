/**
 * Author : Fengyuan(Franklin) Zhang
 * Date : 2018/1/11
 * Description : Task control for load tasks and run them
 */

const request = require('request');
const ModelSerCtrl = require('./modelSerControl');
const DataCtrl = require('./geoDataControl');
const Setting = require('../setting');
const SysCtrl = require('./sysControl');
const Schedule = require('node-schedule');

var CommonMethod = require('../utils/commonMethod');

var TaskCtrl = function () {}

module.exports = TaskCtrl;

TaskCtrl.init = function () {
    global.tasks = [];
    console.log('Task timer started!');
    var rule = new Schedule.RecurrenceRule();
    rule.minute = [0,3,6,9,12,15,18,21,24,27,30,33,36,39,42,45,48,51,54,57];
    Schedule.scheduleJob(rule, ()=>{
        TaskCtrl.getTasks(function(err,status){
            if(err){
                console.log(err);
            }
            if(!status){
                //! TODO
                console.log('No registeration or local network version');
                console.log('---Schedule jobs:' + new Date());
            }else{
                //! TODO
                console.log('Get tasks success, start the calculate service');
                console.log('---Schedule jobs:' + new Date());
            }
        })
       
    });
}

TaskCtrl.addTask = function (task) {
    global.tasks.push(task);
}

TaskCtrl.getByTaskID = function (taskid){
    for(let i = 0; i < global.tasks.length; i++){
        if(taskid == global.tasks[i].taskid){
            return global.tasks[i];
        }
    }
    return null;
}

TaskCtrl.remove = function (taskid) {
    for(let i = 0; i < global.tasks.length; i++){
        if(taskid == global.tasks[i].taskid){
            global.tasks.splice(i, 1);
            return 1;
        }
    }
    return 0;
}

TaskCtrl.loadTask = function (task, callback) {
    var pid = task.pid;
    ModelSerCtrl.getByPID(pid, function (err, items) {
        if(err){
            return callback(err);
        }
        if(items.length == 0){
            return callback(new Error('No such model service!'));
        }
        var ms = items[0]; //default choose the first model service
        var dataInputs = task.inputs;

        var user = {
            u_name : 'TaskServer : [' + task.username + ']',
            u_ip : task.userip,
            u_type : 3
        };

        //! TODO Permission

        var dataCount = 0;
        var dataUploadCb = function (index) {
            dataCount++;
            return function (err, data) {
                dataCount--;
                if(err){
                    return callback(err);
                }
                dataInputs[index].DataId = data;
                if(dataCount == 0){
                    ModelSerCtrl.run(ms._id, dataInputs, null, null, user, function (err, msr) {
                        if(err){
                            return callback(err);
                        }
                        task.msrid = msr._id;
                        TaskCtrl.addTask(task);
                        return callback(null, msr._id);
                    });
                }
            }
        }
        
        for(let i = 0; i < dataInputs.length; i++){
            DataCtrl.downloadByURL(dataInputs[i].Url, {gd_tag : dataInputs[i].Tag}, dataUploadCb(i));
        }
    });
}

//! register in task server: type: 1 - local network; 2 - Internet
TaskCtrl.register = function (ip, port, type = 1, callback) {
    CommonMethod.getMac(function(err, mac){
        if(err){
            return callback(err);
        }
        var params = {
            mac : mac,
            port : Setting.port,
            type : type
        }
        request.post('http://' + ip + ':' + port.toString() + '/server', {
            form : params
        }, function (err, response) {
            if(err){
                return callback(err);
            }
            var resJson = JSON.parse(response.body);
            if(resJson['result'] == 'suc'){
                SysCtrl.setTaskServerInfo({
                    ip : ip,
                    port : port,
                    type : type
                },function(err, result){
                    if(err){
                        //! TODO Rollback
                        return callback(err);
                    }
                    //synchronize model services, no need callback invoke
                    TaskCtrl.synchronize(function(err,result){
                        if(err){
                            // console.log('synchronize model service error');
                        }
                        // console.log('synchronize model service success!');
                    });
                    return callback(null, true);
                });
            }
            else{
                return callback(null, false);
            }
        });
    });
}


// synchronize model services
TaskCtrl.synchronize = function (callback) {
    SysCtrl.getTaskServerInfo(function(err, server){
        if(err){
            return callback(err);
        }
        if(server.ip == '0.0.0.0'){
            return callback(null, false);
        }
        ModelSerCtrl.getOnlineLocalModelSer(function (err, data) {
            if(err){
                return callback(err);
            }
            var pids = [];
            for(var i = 0; i < data.length; i++){
                pids.push(data[i]['ms_model']['p_id']);
            }
            CommonMethod.getMac(function(err, mac){
                if(err){
                    return callback(err);
                }
                request.put('http://' + server.ip + ':' + server.port.toString() + '/server', {form: {
                    mac : mac,
                    pids : JSON.stringify(pids)
                }}, function (err, response) {
                    if(err){
                        return callback(err);
                    }
                    var resJson = JSON.parse(response.body);
                    if(resJson.result == 'suc'){
                        return callback(null, true);
                    }
                    return callback(null, false);
                });
            });
        });
    });
}

// get tasks which need to be executed
TaskCtrl.getTasks = function(callback){
    SysCtrl.getTaskServerInfo(function(err,serverInfo){
        if(err){
            return callback(err);
        }
        //judge, if no register ,return 
        if(serverInfo.ip == '0.0.0.0'){
            return callback(null,false);
        }
        else if(serverInfo.type != 2){
            return callback(null,false);
        }
        else{
            CommonMethod.getMac(function(err, mac){
                if(err){
                    return callback(err);
                }
                //send the request to the Task Server to get the task list which should be invoked 
                var url = 'http://' + serverInfo.ip + ':' + serverInfo.port + '/task/inited/all' + '?mac=' + mac;
                request.get(url,function(err,response){
                    if(err){
                        return callback(err);
                    }
                    var resJson = JSON.parse(response.body);
                    if(resJson.result == 'suc'){
                        var tasks = resJson.data;
                        // handle the tasks
                        if(tasks.length == 0){
                            //indicate no task need to be invoked
                            return callback(null,true);
                        }else{
                            TaskCtrl.loadTasks(tasks,serverInfo,function(err,status){
                                if(err){
                                    return callback(err);
                                }
                                if(!status){
                                    return callback(null,false);
                                }
                                return callback(null,true);
                            })
                        }
                        
                    }else{
                        return callback(null,false);
                    }
                })
            })
            
        }
        
    })
}

//load all tasks
TaskCtrl.loadTasks = function(tasks, serverInfo, callback){
    var size = tasks.length;
    var count = 0;
    if(size){
        //build the callback
        var pending = function(index){
            count++;
            return function(err, result){
                count--;
                if(err){
                    return callback(err);
                }
                if(count == 0){
                    return callback(null,true);
                }

            }
        };

        for(var i = 0; i < size; i++){
            //TODO 是否需要考虑判断全局tasks是否已经存在相同的任务(可能因为某些异常导致了重复任务，虽然可能性很小，后面再考虑)
            var taskinfo = {
                taskid: tasks[i]._id,
                pid: tasks[i].t_pid,
                userip: serverInfo.ip,
                type: tasks[i].t_type,
                username: tasks[i].t_user,
                inputs: tasks[i].t_inputs,
                msrid: '',
                ipport: '127.0.0.1:8060'
            };
            TaskCtrl.loadTaskAndReturn(taskinfo, serverInfo, pending(i));
        }
    }else{
        return callback(null,true);
    }
}

// load the task and return the record id to the task server
TaskCtrl.loadTaskAndReturn = function(task, serverInfo, callback){
    var ip = serverInfo.ip;
    var port = serverInfo.port;
    var task_id = task.taskid;
    TaskCtrl.loadTask(task, function(err, result){
        if(err){
            return callback(err);
        }
        //return the record id to the task server
        var form = {
            status: 2, // 2 represents the Started Status
            msrid: result
        };
        var url = 'http://' + ip + ':' + port + '/task/' + task_id;
        request.put(url,{
            form: form
        }, function(err, response){
            if(err){
                return callback(err);
            }
            var resJson = JSON.parse(response.body);
            if(resJson.result == 'suc'){
                return callback(null,true);
            }
            return callback(null, false);
        })
    })
}
