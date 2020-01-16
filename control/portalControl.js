var setting = require('../setting');
var systemSettingModel = require('../model/systemSetting');
var RemoteControl = require('./remoteReqControl');
var ControlBase = require('./controlBase');
var CommonMethod = require('../utils/commonMethod');

var PortalControl = function() {};
PortalControl.__proto__ = ControlBase;

module.exports = PortalControl;

//登录门户
PortalControl.loginPortal = function(uname, pwd, callback){
    RemoteControl.postRequestJSON('http://' + setting.portal.host + ':' + setting.portal.port + '/GeoModeling/LoginServlet?username=' + uname + '&password=' + pwd, function(err, data){
        if(err){
            return callback(err);
        }
        if(data == '1'){
            return callback(null, true);
        }
        else{
            return callback(null, false);
        }
    });
};

//获取门户账号及密码
PortalControl.getPortalToken = function(callback){
    var portalToken = {};
    systemSettingModel.getValueByIndex('portal_uname', function(err, value){
        if(err){
            return callback(err);
        }
        portalToken['portal_uname'] = value.ss_value;
        systemSettingModel.getValueByIndex('portal_pwd', function(err, value){
            if(err){
                return callback(err);
            }
            portalToken['portal_pwd'] = CommonMethod.decrypto(value.ss_value);
            return callback(null, portalToken);
        });
    });

};
