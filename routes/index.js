var publicRouter = require('./public');
var limitedRouter = require('./limited');
var adminRouter = require('./admin');

var AuthCtrl = require('../control/authControl');

module.exports = function(app)
{
    app.route('/ping')
        .get(function(req, res, next){
            res.end('OK');
        });

    publicRouter(app);
    
    app.route('/')
        .get(function(req, res, next){
            res.redirect('/public/index');
        });
    
    app.route('*')
        .get(function(req, res, next){
            var code = AuthCtrl.getAuth(req);
            switch(code){
                case 1:{
                    next();
                    break;
                }
                case -1:{
                    return res.redirect('/login');
                }
                case -2:{
                    return res.end(JSON.stringify({
                        result : 'fail',
                        message : 'auth failed'
                    }));
                }
            }
        })
        .post(function(req, res, next){
            var code = AuthCtrl.postAuth(req);
            switch(code){
                case 1:{
                    next();
                    break;
                }
                case -1:{
                    res.redirect('login');
                }
                case -2:{
                    res.end(JSON.stringify({
                        result : 'fail',
                        message : 'auth failed'
                    }));
                }
            }
        })
        .put(function(req, res, next){
            var code = AuthCtrl.postAuth(req);
            switch(code){
                case 1:{
                    next();
                    break;
                }
                case -1:{
                    res.redirect('login');
                }
                case -2:{
                    res.end(JSON.stringify({
                        result : 'fail',
                        message : 'auth failed'
                    }));
                }
            }
        });

    //Homepage
    app.route('/index')
        .get(function(req, res, next){
            res.render('index',{
                title:'GeoModeling'
            });
        });

    limitedRouter(app);
    
    app.route('*')
        .get(function(req, res, next){
            if(AuthCtrl.authByAdmin(req) == 1){
                next();
            }
            else{
                res.end(JSON.stringify({err : 'no auth!'}));
            }
        })
        .post(function(req, res, next){
            if(AuthCtrl.authByAdmin(req) == 1){
                next();
            }
            else{
                res.end(JSON.stringify({err : 'no auth!'}));
            }
        })
        .put(function(req, res, next){
            if(AuthCtrl.authByAdmin(req) == 1){
                next();
            }
            else{
                res.end(JSON.stringify({err : 'no auth!'}));
            }
        });

    adminRouter(app);
};
