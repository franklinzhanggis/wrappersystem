/**
 * Created by Franklin on 16-3-16.
 * The setting of the site
 */

var path = require('path');
var os = require('os');

module.exports =  {
    version : "0.2.7",
    port : '8060',
    oid : '56f110136dde7f18b4cb2b87',
    platform : function(){
        if(os.platform() == 'win32'){
            return 1;
        }
        else if(os.platform() == 'linux'){
            return 2;
        }
        else if(os.platform() == 'darwin'){
            return 3;
        }
        else{
            return 0;
        }
    }(),
    crypto:{
        algorithm : 'aes-256-cbc',
        key : 'ae3e712c-ccdf-4964-b819-c85770146485'
    },
    mongodb : {
        name:'GeoModelContainerDB',
        host:'127.0.0.1',
        port:'27017'
    },
    socket:
    {
        host:'127.0.0.1',
        port:'6001'
    },
    portal:
    {
        host:'222.192.7.75',
        port:'80'
    },
    manager:{
        host:'222.192.7.75',
        port:'8084'
    },
    maxins : 10,
    modelpath : __dirname + '/geo_model/',
    mappingPath: (function(){
        //! Release
        return path.dirname(process.execPath) + '/geo_dataMapping/';
        //! Debug
        // return __dirname + '/geo_dataMapping/';
    })(),
    dirname : (function(){
        //! Release
        return path.dirname(process.execPath);
        //! Debug
        // return __dirname;
    })(),
    //! TODO 
    visualizationpath : (function(){
        return __dirname + "/";
    })(),
    data_size : 1
};