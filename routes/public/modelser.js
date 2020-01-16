var ModelSerCtrl = require('../../control/modelSerControl');
var ModelSerAccessCtrl = require('../../control/modelSerAccessControl');
var TestifyCtrl = require('../../control/testifyCtrl');
var utils = require('../../utils/commonMethod');
var RouteBase = require('../routeBase');
var fs = require('fs');
var zip = require('node-native-zip');

module.exports = function(app)
{
    //! View 界面
    //客户端界面
    app.route('/public/index')
        .get(function(req, res, next){
            return res.render('customIndex');
        });

    //模型信息
    app.route('/public/info')
        .get(function(req, res, next){
            return res.render('customInfo');
        });

    //模型服务信息界面
    app.route('/public/modelser/:msid')
        .get(function(req, res, next){
            var msid = req.params.msid;
            if(msid == 'all'){
                return res.render('customModelSers');
            }
            res.render('customModelSerDetail', {
                msid : msid
            });
        });

    //展示某个模型调用界面
    app.route('/public/modelser/preparation/:msid')
        .get(function(req, res, next){
            var msid = req.params.msid;
            return res.render('customModelSerRunPro', {
                msid : msid
            });
        })
        .post(function(req, res, next){
            var msid = req.params.msid;
            ModelSerAccessCtrl.auth(msid, req.body.username, req.body.pwd, function(err, result){
                if(err){
                    return res.end('Error : ' + JSON.stringify(err));
                }
                if(result){
                    req.session.user = req.body.username;
                    req.session.pwd = req.body.pwd;
                    return res.redirect('/public/modelser/preparation/' + msid);
                }
                else{
                    res.end('User name or password error !');
                }
            });
        });
    
    //! API 接口
    //查询模型服务
    app.route('/modelser')
        .get(function(req, res, next){
            if(req.query.ac = 'search'){
                if(req.query.mid){
                    ModelSerCtrl.getByMID(req.query.mid, RouteBase.returnFunction(res, 'Error in searching model services!'));
                }
                else if(req.query.pid){
                    ModelSerCtrl.getByPIDforPortal(req.query.pid, RouteBase.returnFunction(res, 'Error in searching model services!'));
                }
            }
        });
    
    //运行模型服务,新增修改为post请求，同时保留get请求
    app.route('/modelser/:msid')
        .get(function(req, res, next){
            var ac = req.query.ac;
            var msid = req.params.msid;
            var inputData = req.query.inputdata;
            var outputData = req.query.outputdata;
            var cp = req.query.cp;
            if(ac == 'run'){
                //读取输入文件参数
                inputData = JSON.parse(inputData);
                ModelSerCtrl.getByOID(msid, function(err, ms){
                    if(err){
                        return res.end(
                            JSON.stringify({
                                result : 'fail',
                                code : -1,
                                message : "Error in getting model service information!"
                            })
                        );
                    }
                    if(ms == null){
                        return res.end(
                            JSON.stringify({
                                result : 'fail',
                                code : -2,
                                message : 'No such model service!'
                            })
                        );
                    }
                    var user = {
                        u_name : '[UNKNOWN]',
                        u_ip : utils.getIP(req),
                        u_type : 2
                    };
                    if(req.session.admin){
                        user = {
                            u_name : req.session.admin,
                            u_ip : utils.getIP(req),
                            u_type : 0
                        };
                    }
                    if(ms.ms_limited == 1){
                        if(req.query.auth){
                            var auth = req.query.auth;
                            ModelSerAccessCtrl.run(ms.ms_model.p_id, inputData, outputData, cp, user, auth, function(err, result){
                                if(err){
                                    return res.end(
                                        JSON.stringify({
                                            result : 'fail',
                                            code : -1,
                                            message : "Error in invoking model service!"
                                        })
                                    );
                                }
                                if(result.auth){
                                    return res.end(JSON.stringify({
                                        result : 'suc',
                                        code : 1,
                                        data : result.msr._id
                                    }));
                                }
                                else{ 
                                    return res.end(JSON.stringify({
                                        result : 'fail',
                                        code : -3,
                                        message : result.message
                                    }));
                                }
                            });
                        }
                        else{
                            return res.end(JSON.stringify({
                                result : 'fail',
                                code : -4,
                                message : 'No right to invoke this model service!'
                            }));
                        }
                    }
                    else{
                        ModelSerCtrl.run(msid, inputData, outputData, cp, user, function(err, msr){
                            if(err){
                                return res.end(JSON.stringify({
                                    result : 'err',
                                    code : -3,
                                    message : err.message
                                }));
                            }
                            return res.end(JSON.stringify({
                                result : 'suc',
                                code : 1,
                                data : msr._id
                            }));
                        });
                    }
                });
            }
            else{
                next();
            }
        })
        .post(function(req,res,next){
            var ac = req.query.ac;
            var msid = req.params.msid;
            var inputData = req.body.inputdata;
            var outputData = req.body.outputData;
            var controlParam = req.body.cp;
            if(ac === 'run'){
                ModelSerCtrl.getByOID(msid, function(err, ms){
                    if(err){
                        return res.end(
                            JSON.stringify({
                                result : 'fail',
                                code : -1,
                                message : "Error in getting model service information!"
                            })
                        );
                    }
                    if(ms == null){
                        return res.end(
                            JSON.stringify({
                                result : 'fail',
                                code : -2,
                                message : 'No such model service!'
                            })
                        );
                    }
                    var user = {
                        u_name : '[UNKNOWN]',
                        u_ip : utils.getIP(req),
                        u_type : 2
                    };
                    if(req.session.admin){
                        user = {
                            u_name : req.session.admin,
                            u_ip : utils.getIP(req),
                            u_type : 0
                        };
                    }
                    if(ms.ms_limited == 1){
                        if(req.query.auth){
                            var auth = req.query.auth;
                            ModelSerAccessCtrl.run(ms.ms_model.p_id, inputData, outputData, controlParam, user, auth, function(err, result){
                                if(err){
                                    return res.end(
                                        JSON.stringify({
                                            result : 'fail',
                                            code : -1,
                                            message : "Error in invoking model service!"
                                        })
                                    );
                                }
                                if(result.auth){
                                    return res.end(JSON.stringify({
                                        result : 'suc',
                                        code : 1,
                                        data : result.msr._id
                                    }));
                                }
                                else{ 
                                    return res.end(JSON.stringify({
                                        result : 'fail',
                                        code : -3,
                                        message : result.message
                                    }));
                                }
                            });
                        }
                        else{
                            return res.end(JSON.stringify({
                                result : 'fail',
                                code : -4,
                                message : 'No right to invoke this model service!'
                            }));
                        }
                    }else{
                        ModelSerCtrl.run(msid, inputData, outputData, controlParam, user, function(err, msr){
                            if(err){
                                return res.end(JSON.stringify({
                                    result : 'err',
                                    code : -3,
                                    message : err.message
                                }));
                            }
                            return res.end(JSON.stringify({
                                result : 'suc',
                                code : 1,
                                data : msr._id
                            }));
                        });
                    }
                })
            }else{
                next();
            }
        })

    //模型服务信息API
    app.route('/modelser/json/:msid')
        .get(function(req, res, next){
            var msid = req.params.msid;
            if(msid == 'all'){
                if(req.query.type == 'admin'){
                    next();             
                }
                else{
                    if(req.query.start || req.query.count){
                        var start = 0;
                        var count = 0;
                        if(req.query.start){
                            start = req.query.start;
                        }
                        if(req.query.count){
                            count = req.query.count;
                        } 
                        return ModelSerCtrl.getLocalModelSerByPage(start, count, RouteBase.returnFunction(res, 'Error in getting all model services!'));
                    }
                    else{
                        return ModelSerCtrl.getLocalModelSer(RouteBase.returnFunction(res, 'Error in getting all model services!'));
                    }
                }
            }
            else{
                return ModelSerCtrl.getByOID(msid, RouteBase.returnFunction(res, 'Error in getting model services!'));
            }
        });

        
    //模型输入信息API
    app.route('/modelser/inputdata/json/:msid')
        .get(function(req, res, next){
            var msid = req.params.msid;
            ModelSerCtrl.getInputData(msid, RouteBase.returnFunction(res, 'Error in getting input data!'));
        });
    
    //获取所有测试数据
    app.route('/modelser/testify/:msid')
        .get(function (req, res) {
            var msid = req.params.msid;
            //暂时放到这里，用来生成已经部署过的模型的测试数据
            // TestifyCtrl.getTestify(msid,function (data){
            //     res.end(data);
            // });
            TestifyCtrl.getTestify(msid,RouteBase.returnFunction(res, 'Error in getting testify data!'));      
        })
        ////将测试数据添加到geo_data目录中
        .put(function(req,res,next){
            var msid = req.params.msid;
            var path = req.query.path;
            // TestifyCtrl.loadTestify(msid,path, function(data){
            //     res.end(data);
            // });
            TestifyCtrl.loadTestify(msid,path,RouteBase.returnFunction(res,''));
         });

    app.route('/modelser/outputtestify/:msid')    
        .get(function(req,res){
            var msid = req.params.msid;
            var path = req.query.path;
            TestifyCtrl.loadOutputTestify(msid,path,function(data){
                res.end(data);
            });
        });

    //下载测试数据（针对门户所开放接口）
    app.route('/modelser/testifydownload/:msid')
       .get(function(req,res,next){
            var msid = req.params.msid;
            var path = req.query.path;
            var dataid = req.query.dataid;
            if(dataid == 'all'){
                //实现默认下载所有测试数据的功能，打包
                TestifyCtrl.getAllTestifyPath(msid,path,function(err,data){
                    if(err){
                        return res.end('error');
                    }else{
                        var archive = new zip();

                        archive.addFiles(data.filetozip,function(err){
                            if(err){
                                console.log("err while adding files",err);
                                return res.end('error');
                            }
                             var buff = archive.toBuffer();
                             var zipname = 'default.zip';
                             //并不需要存储，直接通过流发送
                             res.set({
                                'Content-Type': 'file/*',
                                'Content-Length': buff.length });
                             res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(zipname));
                             res.end(buff);
                        })
                    }
                })
            }else{
                //下载特定的默认测试数据
                TestifyCtrl.getTestifyPath(msid,path,dataid,function(err,data){
                     if(err){
                         return res.end('error');
                     }
                     var path = data;
                     fs.access(path,fs.R_OK, function(err){
                         if(err){
                             return res.end('Data file do not exist!');
                         }else{
                             fs.readFile(path,function(err,data){
                                 if(err){
                                     return res.end('error');
                                 }
                                 res.set({
                                    'Content-Type': 'file/*',
                                    'Content-Length': data.length });
                                res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(dataid));
                                res.end(data);
                             })
                         }
                     })
                })

                
            }
       });

    //根据pid下载模型部署包
    app.route('/modelser/downloadPackage/:pid')
        .get(function(req,res,next){
            var pid = req.params.pid;
            ModelSerCtrl.getDeployPackagePathByPid(pid,function(err,result){
                if(err){
                    return res.end('error');
                }
                fs.readFile(result.path,function(err,data){
                    if(err){
                        return res.end('error');
                    }
                    res.set({
                        'Content-Type':'file/*',
                        'Content-Length':data.length
                    });
                    res.setHeader('Content-Disposition','attachment; filename=' + encodeURIComponent(result.filename));
                    res.end(data);
                })
            });
        });
    
    //加载框图模型信息
    app.route('/modelser/diagram/json/:msid')
        .get(function(req, res, next){
            ModelSerCtrl.getModelDiagram(req.params.msid, RouteBase.returnFunction(res, 'Error in getting diagram model!'));
        });

    //获取单个模型实例
    app.route('/modelins/json/:guid')
        .get(function (req, res, next) {
            var guid = req.params.guid;
            if(guid == 'all')
            {
                next();
            }
            else
            {
                var mis = app.modelInsColl.getByGUIDCopy(guid);
                if(mis != -1)
                {
                    return res.end(JSON.stringify({
                        result : "suc",
                        code : 1,
                        data : mis
                    }));
                }
                else
                {
                    return res.end(JSON.stringify({
                        result : "suc",
                        code : 0,
                        data : null
                    }));
                }
            }
        });

    //单个模型实例的操作
    app.route('/modelins/:guid')
        .put(function(req, res, next){
            var ac = req.query.ac;
            var guid = req.params.guid;
            if(ac == 'kill'){
                var flag = app.modelInsColl.kill(guid);
                if(flag == 1){
                    return res.end(JSON.stringify({
                        result : 'suc',
                        code : 1,
                        data : 1
                    }));
                }
                return res.end(JSON.stringify({
                    result : 'fail',
                    data : 1,
                    message : 'Fail to kill the instance!'
                }));
            }
            else if(ac == 'pause'){
                var mis = app.modelInsColl.getByGUID(guid);
                if(mis != -1){
                    mis.pause();
                    return res.end(JSON.stringify({
                        result : 'suc',
                        code : -1,
                        data : 1
                    }));
                }
                else{
                    return res.end(JSON.stringify({
                        result : 'err',
                        code : -2,
                        message : 'No such instance!'
                    }));
                }
            }
            else if(ac == 'resume'){
                var mis = app.modelInsColl.getByGUID(guid);
                if(mis != -1){
                    mis.resume();
                    return res.end(JSON.stringify({
                        result : 'suc',
                        code : 1,
                        data : 1
                    }));
                }
                else{
                    return res.end(JSON.stringify({
                        result : 'err',
                        code : -2,
                        message : 'No such instance!'
                    }));
                }
            }
            else if(ac == 'updatedata'){
                var data = req.query.data;
                var mis = app.modelInsColl.getByGUID(guid);
                mis.updateData(data);
                return res.end(JSON.stringify({
                    result : 'suc',
                    code : 1,
                    data : 1
                }));
            }
            return res.end(JSON.stringify({
                result : 'err',
                code : -3,
                message : 'Unknown cmd!'
            }));
        });
}