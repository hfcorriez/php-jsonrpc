function rpc(namespace, params, callbacks){
    $.jsonRPC.endPoint = './test.php';
    $.jsonRPC.dateType = 'jsonp';
    $.jsonRPC.jsonp = 'cb';
    if(typeof callbacks != 'undefined' && typeof callbacks.before == 'function')
        callbacks.before();
    $.jsonRPC.request(namespace, params, {
        error: function(json) {
            if(typeof callbacks != 'undefined' && typeof callbacks.error == 'function')
                callbacks.error(json['error']);
        },
        success: function(json) {
            if(typeof callbacks != 'undefined' && typeof callbacks.success == 'function')
                callbacks.success(json['result']);
        },
        complete:function(){
            if(typeof callbacks != 'undefined' && typeof callbacks.complete == 'function')
                callbacks.complete();
        }
    });
}

//btnRpc('namespace', 'input[0]', 'input[1]', 'input[2]', 'textarea');

function btnRpc(){
    if(arguments.length == 0){
        alert('rpc call error.');
        return false;
    }
    var params = [];
    for(var i=0; i<arguments.length; i++){
        if(i==0)
            var namespace = arguments[i];
        else if(i == arguments.length - 2)
            var output = $(arguments[i]);
        else if(i == arguments.length - 1)
            var button = $(arguments[i]);
        else
            params[params.length] = $(arguments[i]).val();
    }
    var saveedButton = '';
    var callbacks = {
        before: function(){
            button.attr('disabled', true);
            saveedButton = button.val();
            button.val('进行中...');
        },
        error: function(err){
            alert(err);
        },
        success: function(ret){
            if(output.is(':text'))
                output.val(ret);
            else
                output.html(ret);
        },
        complete: function(){
            button.attr('disabled', false);
            button.val(saveedButton);
        }
    };
    return rpc(namespace, params, callbacks);
}

/*
rpc('test', 1, 2, function(result){
    alert(result);
});
*/