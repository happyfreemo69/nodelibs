var Cutter = require('./cut');
var errors = require('./errors');
var ok = require('./ok');

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

function andRules(arr, key, val){
    return errors.concatErrors(arr, function(ruleObj){
        return validateRuleObj(ruleObj, key, val);
    });
}

function orRules(obj, key, val){
    for(var i in obj){
        var ruleObj = obj[i];
        var res = validateRuleObj(ruleObj, key, val);
        if(ok(res)){
            return res;
        }
        if(res instanceof Cutter.CutErrors){
            return res;
        }
    }
    return [label(key, 'could not validate ',val)];
}

function validateRuleObj(ruleObj, key, val){
    var res;
    if(typeof(ruleObj) === 'function'){
        res = ruleObj(key, val);
    }else if(ruleObj instanceof Array){
        res = andRules(ruleObj, key, val);
    }else if(ruleObj instanceof Cutter.Cut){
        res = validateRuleObj(ruleObj.f, key, val);
        res = new Cutter.CutErrors(res);
    }else{
        res = orRules(ruleObj, key, val);
    }
    return res;
}

module.exports = {
    andRules:andRules,
    orRules:orRules,
    validateRuleObj:validateRuleObj,
    concatErrors:concatErrors
}