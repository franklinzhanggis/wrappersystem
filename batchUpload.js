var fs = require('fs');

var ModelSerCtrl = require('./control/modelSerControl');
var FileOpera = require('./utils/fileOpera');
var Setting = require('./setting');

var Sleep = async (duration) => {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, duration);
    });
};

var BatchUpload = async function(){
    let path = Setting.dirname + '/upload/';
    let fields = {};
    fields.u_name = '[OpenGMS]';
    fields.u_email = '[Unknown]';
    fields.ms_permission = 0;
    fields.ms_limited = 0;
    fields.batch = true;
    var dirs = fs.readdirSync(path);
    var count = 0;
    let successCount = 0;
    let errorCount = 0;
    let errList = [];
    console.log('[' + dirs.length.toString() + '] files in all!');
    let pending = (function(index){
        count ++;
        console.log('[' + count.toString() + '] has been detected!');
        return (function(err, result){
            count --;
            console.log('[' + dirs.length + '] packages in all and [' + count.toString() + '] remain!' )
            if(err){
                errList.push(dirs[index]);
                errorCount++;
                console.log('Warning : Model Service Package [' + dirs[index] + '] has error in deploying!');
            }
            else{
                successCount++;
                console.log('Model Service Package [' + dirs[index] + '] has deployed!');
            }
            if(count == 0){
                console.log('All Finished! [' + successCount.toString() + '] have been deployed successfully and [' + errorCount.toString() + '] error in deployment!');
                fs.writeFile(path + 'errlist.json', JSON.stringify(errList), function(err, result){});
            }
        })
    });
    for(let i = 0; i < dirs.length; i++){
        if(dirs[i].substr(dirs[i].lastIndexOf('.')) == '.zip')
            ModelSerCtrl.addNewModelSer(fields, {file_model : {path : path + dirs[i]}}, pending(i));
            await Sleep(1000);
    }
}

module.exports = BatchUpload;

