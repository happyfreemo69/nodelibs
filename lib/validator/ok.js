var funcs = [];
function ok(res){
    var result = res instanceof Array && res.length === 0 || res === true;
    if(result) return true;
    return funcs.some(function(f){
        return f(res);
    });
}

module.exports = ok;
ok.addOrFunc = function(f){
    funcs.push(f);
}