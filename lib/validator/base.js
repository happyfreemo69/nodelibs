var Promise = require('bluebird');
var Field = require('./field');
var Cutter = require('./cut');
var ruler = require('./ruler');
var ok = require('./ok');
/**
 * Kiss library
 * Every Field method return itself to chain methods
 * Every Field method associates a list of rule object
 *
 * A rule is a method returning [] or an error string
 * A rule obj is an object key->ruleObj or a rule
 * validating a field validates all its rules: [] or array of errors
 * validating a rule object validates one of its entry: [] or array of errors
 * validating an entry validates all rules of the array: [] or array of errors
 *
 * A field can be composed of subFields.. in which case
 * validating a field also validates all its subFields
 *
 * Validate equals considering the object as a field composed of subfields
 *
 * @constructor
 */
function flatten(res, stack){
    var arr = stack || [];
    if(res instanceof Array){
        res.forEach(function(x){
            flatten(x, arr);
        })
    }else{
        stack.push(res);
    }
    return arr;
}

function validateSchema(schema, obj){
    return ruler.concatErrors(Object.keys(schema), function(key){
        var field = schema[key];
        return field.validate(key, obj[key]);
    })
}

var Validator = {};
['num', 'str', 'anyNws', 'func', 'req', 'sub','objId', 'arr','bool','enum','ok'].forEach(function(key){
    Validator[key] = function(){
        var f = new Field({validateSchema: validateSchema});
        return f[key].apply(f, arguments);
    }
});
Validator.validate = function(schema, obj){
    var res = validateSchema(schema, obj);
    res = Validator.clean(res);
    return ok(res)? Promise.resolve():Promise.reject(res);
};
Validator.clean = function(res){
    res = Cutter.uncut(res);
    res = flatten(res);
    return res;
}

module.exports = Validator;