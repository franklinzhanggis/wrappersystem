/**
 * Created by Franklin on 16-5-30.
 * Socket for Model Container
 */
var net = require('net');
var colors = require('colors');

var setting = require('../setting');
var debugSetting = require('../debugSetting.json')
var ModelSerRunCtrl = require('../control/modelSerRunControl');
var GeoDataCtrl = require('../control/geoDataControl');
var NoticeCtrl = require('../control/noticeCtrl');
var ModelInsCtrl = require('../control/ModelInsCtrl');
var SysCtrl = require('../control/sysControl');
var ModelSerCtrl = require('../control/modelSerControl');

function SocketTrans(app, host, port)
{
    if (!host){
        host = setting.socket.host
    }
    if (!port){
        port = setting.socket.port
    }
    var server = net.createServer(function(socket) {

        // 我们获得一个连接 - 该连接自动关联一个socket对象
        console.log('CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);

        // 为这个socket实例添加一个"data"事件处理函数
        socket.on('data', function(data) {
            console.log('SOCKET'.green + ' Get Message From [' + socket.remoteAddress.yellow + '] Message: [' + data.toString("utf8").cyan + ']\n');
            var recvBuf = data.toString();

            var msgs = recvBuf.split('\0');
            for(var i = 0; i < msgs.length; i++){
                recvBuf = msgs[i];
                if(recvBuf == ''){
                    continue;
                }
                console.log(recvBuf.cyan);
                var opLeft = recvBuf.indexOf('{');
                var opRight = recvBuf.indexOf('}');
                if(opLeft == -1 || opRight == -1 || opRight < opLeft){
                    return console.log('illegal commad! Can not find OP. Original cmd : ' + recvBuf);
                }
                var op = recvBuf.substr(opLeft + 1, opRight - opLeft - 1);
                
                var idRight = recvBuf.indexOf('&');
                var id = '';
                if(idRight == -1){
                    id = recvBuf.substr(opRight + 1);
                    id = id.replace('\0','');
                }
                else if(opRight > idRight){
                    return console.log('illegal commad! Can not find ID. Original cmd : ' + recvBuf);
                }
                else{
                    id = recvBuf.substr(opRight + 1, idRight - opRight - 1);
                }
                opLeft = recvBuf.indexOf('}');
                var cmd = recvBuf.substr(opLeft + 1);
                cmd = cmd.replace('\0','');
                switch(op){
                    case 'init':{
                        ModelInsCtrl.Initialize(id, socket);
                        break;
                    }
                    case 'onEnterState':{
                        var queryStr = cmd.split('&');
                        var sid = queryStr[1];
    
                        ModelInsCtrl.EnterState(id, sid);
                        break;
                    }
                    case 'onFireEvent':{
                        var queryStr = cmd.split('&');
                        var sid = queryStr[1];
                        var event = queryStr[2];
                        ModelInsCtrl.FireEvent(id, sid, event);
                        break;
                    }
                    case 'onRequestData':{
                        var queryStr = cmd.split('&');
                        var sid = queryStr[1];
                        var event = queryStr[2];
                        
                        ModelInsCtrl.RequestData(id, sid, event);
                        break;
                    }
                    case 'onResponseData':{
                        var queryStr = cmd.split('&');
    
                        //! querys
                        var sname = queryStr[1];
                        var event = queryStr[2];
                        var signals = queryStr[3];
    
                        //! data
                        opLeft = cmd.lastIndexOf(']');
                        var data = cmd.substr(opLeft + 1);
                        data = data.replace('\0', '');
                        var nameLength = signals.substr(0, signals.indexOf('['));
                        var dataSignal = signals.substr(signals.indexOf('[') + 1, signals.indexOf(']') - signals.indexOf('[') - 1);
                        signals = signals.substr(signals.indexOf(']') + 1);
                        var dataType = signals.substr(1, signals.indexOf(']') - 1);
                        var dataFormat = dataType.substr(dataType.indexOf('|') + 1);
                        dataType = dataType.substr(0, dataType.indexOf('|'));
    
                        if (data == '')
                            ModelInsCtrl.ResponseDataPrepare(id, sname, event, data, dataSignal, dataType, dataFormat);
                        else
                            ModelInsCtrl.ResponseDataReceived(id, sname, event, data, dataSignal, dataType, dataFormat);
                        break;
                    }
                    case 'onPostErrorInfo':{
                        var errorinfo = '';
                        var queryStr = cmd.split('&');
                        errorinfo = queryStr[1];
    
                        ModelInsCtrl.PostErrorInfo(id, errorinfo);
                        break;
                    }
                    case 'onPostWarningInfo':{
                        var warninginfo = '';
                        var queryStr = cmd.split('&');
                        warninginfo = queryStr[1];
    
                        ModelInsCtrl.PostWarningInfo(id, warninginfo);
                        break;
                    }
                    case 'onPostMessageInfo':{
                        var messageinfo = '';
                        var queryStr = cmd.split('&');
                        messageinfo = queryStr[1];
    
                        ModelInsCtrl.PostMessageInfo(id, messageinfo);
                        break;
                    }
                    case 'onGetModelAssembly':{
                        var queryStr = cmd.split('&');
                        var assemblyName = queryStr[1];
                        ModelInsCtrl.GetModelAssembly(id, assemblyName);
                        break;
                    }
                    case 'onLeaveState':{
                        var sid = '';
                        ModelInsCtrl.LeaveState(id, sid);
                        break;
                    }
                    case 'onFinalize':{
                        var sid = '';
                        ModelInsCtrl.Finalize(id);
                        break;
                    }
                    case 'ProcessParams':{
                        var queryStr = cmd.split('&');
                        ModelInsCtrl.setProcessParams(id, queryStr[1])
                    }
                    case 'onInitControlParam':{
                        var queryStr = cmd.split('&');
                        ModelInsCtrl.setProcessParams(id, queryStr[1])
                    }
                }
            }
        });

        // 为这个socket实例添加一个"close"事件处理函数
        socket.on('close', function(data) {
            // console.log('[DEBUG] Socket end!');
            //找到对应的内存对象
            var mis = app.modelInsColl.getBySocekt(socket);
            ModelSerRunCtrl.getByGUID(mis.guid, function (err,msr) {
                // console.log('[DEBUG] MSR checking in socketing end!');
                if(err)
                {
                    console.log('Error in finding MSR when socket closed!');
                }
                if(msr == null)
                {
                    console.log('Can not find MSR when socket closed!');
                    return ;
                }
                //判断是否结束
                var finished = false;
                if(mis.state == 'Finalized')
                {
                    finished = true;
                }
                //计算时间
                var date_now = new Date();
                var data_begin = new Date(msr.msr_datetime);
                var time_span = date_now.getTime() - data_begin.getTime();
                time_span = time_span / 1000;
                msr.msr_span = time_span;
                msr.msr_logs = mis.log;
                if(finished)
                {
                    msr.msr_status = 1;
                }
                else
                {
                    msr.msr_status = -1;
                }
                msr.msr_input = mis.input;
                msr.msr_output = mis.output;
                msr.msr_processparams = mis.processParams;
                msr.msr_controlparams = mis.controlParams;
                ModelSerRunCtrl.update(msr, function (err2, data) {
                    // console.log('[DEBUG] MSR updating finished in socketing end!');
                    if(err2)
                    {
                        return console.log('Error in removing modelIns and updating MSR');
                    }

                    if(msr.msr_user.u_name != '[DEBUGGER]'){
                        if(!debugSetting.debug || (mis.guid != debugSetting.debugGUID)){
                            //移除该实例
                            app.modelInsColl.removeBySocekt(socket);
                        }
                    }

                    //模型运行结束之后发起taskFinished请求
                    ModelSerCtrl.taskFinished(msr, function (err,result) {});
                    

                    //销毁必要数据
                    for(var i = 0; i < msr.msr_input.length; i++){
                        var destroyed = msr.msr_input[i].Destroyed;
                        if(typeof(destroyed) === 'boolean'){
                            if(destroyed){
                                GeoDataCtrl.delete(msr.msr_input[i].DataId, function(err, result){
    
                                });
                            }
                        }else{
                            if(destroyed === 'true'){
                                GeoDataCtrl.delete(msr.msr_input[i].DataId, function(err, result){
                                    
                                });
                            }
                        }
                        
                    }

                    //通知消息数据
                    if(msr.msr_ms){
                        var noticeData = {
                            time : new Date(),
                            title : msr.msr_ms.ms_model.m_name + ' Stopped',
                            detail : '',
                            type : 'stop-run',
                            hasRead : false
                        };
                        NoticeCtrl.save(noticeData,function (err, data) {
                            if(err){
                                return console.log('Error in addNotice');
                            }
                        });
                    }
                });

            });
            console.log('CLOSED: ' + socket.remoteAddress + ' ' + socket.remotePort);
        });

        socket.on('error', function (msg) {
            console.log('ERROR: ' + msg);
        });

        socket.on('end', function () {
            console.log('SOCKET END !!! ');
        });
    }).listen(port, host);

    console.log('Socket listening on ' + host +':'+ port);
}

module.exports = SocketTrans;
