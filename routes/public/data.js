var fs = require('fs');

var GeoDataMid = require('../../middlewares/geoDataMid');
var GeoDataCtrl = require('../../control/geoDataControl');
var ModelSerRunCtrl = require('../../control/modelSerRunControl');
var setting = require('../../setting');
var RouteBase = require('../routeBase');

module.exports = function (app) {
    //上传数据
    app.route('/geodata')
        .post(function (req, res, next) {
            var type = req.query.type;
            if (type == 'file') {
                GeoDataMid.postFileData(req, RouteBase.returnFunction(res, "Error in uploading data file!"));
            }
            else if (type == 'stream') {
                GeoDataMid.postStreamData(req, RouteBase.returnFunction(res, "Error in uploading data stream!"));
            }
            else if (type == 'url') {
                //准备添加请求url数据路由
                GeoDataMid.postUrlData(req, RouteBase.returnFunction(res, "Error in uploading data URL!"));
            }
        })
        

    //下载数据
    app.route('/geodata/:gdid')
        .get(function (req, res, next) {
            var gdid = req.params.gdid;
            if (gdid == 'all') {
                next();
            }
            else {
                var ac = req.query.ac;
                if (ac == 'visualize') {
                    res.render('dataVisualize_r', {
                        gdid: gdid
                    });
                }
                else {
                    GeoDataCtrl.getByKey(gdid, function (err, gd) {
                        if (err) {
                            return res.end('error');
                        }
                        if (gd == null || gd.length == 0) {
                            return res.end('No Data!');
                        }
                        ModelSerRunCtrl.IsOutputData2BDestroyed(gd.gd_id, function (err, destroyed) {
                            if (err) {
                                return res.end('Error in getting destory information!');
                            }
                            var filename = '';
                            if(gd.gd_type == 'FILE' || gd.gd_type == 'RAW')
                            {
                                fs.access(setting.dirname + '/geo_data/' + gd.gd_value, fs.R_OK, function(err) {
                                    if (err) {
                                        GeoDataCtrl.delete(gdid, function (err, reslut) {
                                            return res.end('Data file do not exist!')
                                        });
                                    }
                                    else {
                                        fs.readFile(setting.dirname + '/geo_data/' + gd.gd_value, function (err, data) {
                                            if(err)
                                            {
                                                return res.end('error');
                                            }
                                            //! 判断文件类型
                                            var ext = gd.gd_value.substr(gd.gd_value.lastIndexOf('.'));
                                            if (gd.gd_tag.lastIndexOf('.') == -1) {
                                                filename = gd.gd_tag + ext;
                                            } else {
                                                filename = gd.gd_tag;
                                            }

                                            res.set({
                                                'Content-Type': 'file/*',
                                                'Content-Length': data.length
                                            });
                                            res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
                                            res.end(data);
                                            //销毁数据
                                            if (destroyed) {
                                                GeoDataCtrl.delete(gd.gd_id, function (err, result) { });
                                            }
                                        });
                                    }
                                });
                            }
                            else if(gd.gd_type == 'STREAM')
                            {

                                res.set({
                                    'Content-Type': 'file/xml',
                                    'Content-Length': gd.gd_value.length });
                                res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(gd.gd_tag + '.xml'));
                                res.end(gd.gd_value);
                                //销毁数据
                                if (destroyed) {
                                    GeoDataCtrl.delete(gd.gd_id, function (err, result) { });
                                }
                            }
                            
                            else if(gd.gd_type == 'XML'){
                                fs.access(setting.dirname + '/geo_data/' + gd.gd_value, fs.R_OK, function(err) {
                                    if (err) {
                                        GeoDataCtrl.delete(gdid, function (err, reslut) {
                                            return res.end('Data file do not exist!')
                                        });
                                    }
                                    else {
                                        fs.readFile(setting.dirname + '/geo_data/' + gd.gd_value, function (err, data) {
                                            if(err)
                                            {
                                                return res.end('error');
                                            }
                                            //! 判断文件类型
                                            var ext = gd.gd_value.substr(gd.gd_value.lastIndexOf('.'));
                                            if(gd.gd_tag.lastIndexOf('.') == -1){
                                                filename = gd.gd_tag + ext;
                                            }else{
                                                filename = gd.gd_tag;
                                            }
                                            res.set({
                                                'Content-Type': 'file/xml',
                                                'Content-Length': data.length });
                                            res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
                                            res.end(data);
                                            //销毁数据
                                            if (destroyed) {
                                                GeoDataCtrl.delete(gd.gd_id, function (err, result) { });
                                            }
                                        });
                                    }
                                });
                            }
                            else if(gd.gd_type == 'ZIP'){
                                fs.access(setting.dirname + '/geo_data/' + gd.gd_value, fs.R_OK, function(err) {
                                    if (err) {
                                        GeoDataCtrl.delete(gdid, function (err, reslut) {
                                            return res.end('Data file do not exist!')
                                        });
                                    }
                                    else {
                                        fs.readFile(setting.dirname + '/geo_data/' + gd.gd_value, function (err, data) {
                                            if(err)
                                            {
                                                return res.end('error');
                                            }
                                            //! 判断文件类型
                                            var ext = gd.gd_value.substr(gd.gd_value.lastIndexOf('.'));
                                            if (gd.gd_tag.lastIndexOf('.') == -1) {
                                                filename = gd.gd_tag + ext;
                                            } else {
                                                filename = gd.gd_tag;
                                            }
                                            res.set({
                                                'Content-Type': 'file/zip',
                                                'Content-Length': data.length
                                            });
                                            res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
                                            res.end(data);
                                            //销毁数据
                                            if (destroyed) {
                                                GeoDataCtrl.delete(gd.gd_id, function (err, result) { });
                                            }
                                        });
                                    }
                                });
                            }
                            else{
                                fs.access(setting.dirname + '/geo_data/' + gd.gd_value, fs.R_OK, function(err) {
                                    if (err) {
                                        GeoDataCtrl.delete(gdid, function (err, reslut) {
                                            return res.end('Data file do not exist!')
                                        });
                                    }
                                    else {
                                        fs.readFile(setting.dirname + '/geo_data/' + gd.gd_value, function (err, data) {
                                            if(err)
                                            {
                                                return res.end('error');
                                            }
                                            //! 判断文件类型
                                            var ext = gd.gd_value.substr(gd.gd_value.lastIndexOf('.'));
                                            if (gd.gd_tag.lastIndexOf('.') == -1) {
                                                filename = gd.gd_tag + ext;
                                            } else {
                                                filename = gd.gd_tag;
                                            }
                                            res.set({
                                                'Content-Type': 'file/*',
                                                'Content-Length': data.length
                                            });
                                            res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
                                            res.end(data);
                                            //销毁数据
                                            if (destroyed) {
                                                GeoDataCtrl.delete(gd.gd_id, function (err, result) { });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    });
                }
            }
        });
    // 查看数据
    app.route('/geodata/json/:gdid')
        .get(function (req, res, next) {
            var gdid = req.params.gdid;
            if (gdid == "all") {
                next();
            }
            else {
                GeoDataCtrl.getByKey(gdid, function (err, gd) {
                    if (err) {
                        return res.end('error');
                    }
                    if (gd == null) {
                        return res.end(JSON.stringify({
                            result: 'suc',
                            code: 1,
                            data: ''
                        }));
                    }
                    return res.end(JSON.stringify({
                        result: 'suc',
                        code: 1,
                        data: gd
                    }));
                });
            }
        });

}