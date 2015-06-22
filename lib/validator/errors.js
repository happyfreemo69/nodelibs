var Cutter = require('./cut');

function concatErrors(arr, iter){
    var err = [];
    var cutIt = false;
    arr.every(function(obj){
        var res = iter(obj);
        if(res instanceof Cutter.CutErrors){
            cutIt = true;
        }
        if(!ok(res)){
            err.push(res);
            return false;
        }
        return true;
    });
    if(cutIt){
        return new Cutter.CutErrors(err);
    }
    return err;
}

function ok(res){
    return res instanceof Array && res.length === 0 || res === true || res instanceof Cutter.CutErrors && res.ok();
}

module.exports = {
    concatErrors:concatErrors,
    ok:ok
}