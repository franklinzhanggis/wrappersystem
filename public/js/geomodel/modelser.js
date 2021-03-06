/**
 * Created by Franklin on 2016/7/26.
 * Client ModelService Opera
 */

//关闭模型服务
function ms_stop(msid,host) {
    if(confirm("确认关闭模型服务？") == true)
    {
        $.ajax({
            url:(function () {
                if(host == 'localhost'){
                    return '/modelser/' + msid + '?ac=stop';
                }
                else{
                    return '/modelser/rmt/' + host + '/' + msid + '?ac=stop';
                }
            })(),
            type:'PUT',
            success:function (data) {
                var resjson = JSON.parse(data);
                if(resjson.res == "Error")
                {
                    alert(resjson.mess);
                }
                else if(resjson.res == "Stopped")
                {
                    alert("模型服务已经处于关闭状态！");
                }
                else if(resjson.res == "Success")
                {
                    alert("已关闭模型服务！");
                    window.location.reload();
                }
            }
        });
    }
}

//开启模型服务
function ms_start(msid,host) {
    if(confirm("确认开启模型服务？") == true)
    {
        $.ajax({
            url:(function () {
                if(host == 'localhost'){
                    return '/modelser/' + msid + '?ac=start';
                }
                else{
                    return '/modelser/rmt/' + host + '/' + msid + '?ac=start';
                }
            })(),
            type:'PUT',
            success:function (data) {
                var resjson = JSON.parse(data);
                if(resjson.res == "Error")
                {
                    alert(resjson.mess);
                }
                else if(resjson.res == "Started")
                {
                    alert("模型服务已经处于开启状态！");
                }
                else if(resjson.res == "Success")
                {
                    alert("已开启模型服务！");
                    window.location.reload();
                }
            }
        });
    }
}

//删除模型服务
function ms_delete(ms_id,host) {
    if (confirm('确认删除模型服务？'))
    {
        $.ajax({
            url:(function () {
                if(host == 'localhost'){
                    return '/modelser/' + ms_id;
                }
                else{
                    return '/modelser/rmt/' + host + '/' + ms_id;
                }
            })(),
            type:'DELETE',
            success:function (data) {
                var resJson = JSON.parse(data);
                if(resJson.res == 'err')
                {
                    alert(resJson.err);
                }
                else if(resJson.res == 'suc')
                {
                    alert('模型服务删除成功!');
                    window.location.href = '/modelser/all'
                }
            }
        });
    }
}

