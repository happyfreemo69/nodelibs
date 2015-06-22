var rules = require('./baseRules');
var Cutter = require('./cut');
var errors = require('./errors');
var ruler = require('./ruler');
var ok = require('./ok');

function getNumber(val, ref){
    if(!isNaN(val)){
        return val;
    }
    return ref;
}

function Field(o){
    this.rules = [];
    this.validateSchema = o.validateSchema;
}

Field.prototype.num = function(min, max){
    min = getNumber(min, -Number.MAX_VALUE);
    max = getNumber(max, Number.MAX_VALUE);
    this.rules.push({
        num:[
            rules.mandatory,
            Cutter.cut(rules.isNumber),
            rules.minNum(min),
            rules.maxNum(max)
        ],
        ok:rules.anything
    });
    return this;
};

Field.prototype.str = function(min, max){
    min = getNumber(min, 0);
    max = getNumber(max, Number.MAX_VALUE);
    this.rules.push({
        num:[
            rules.mandatory,
            Cutter.cut(rules.isString),
            rules.minLength(min),
            rules.maxLength(max)
        ],
        ok:rules.anything
    });
    return this;
};

/**
 * - if no arguments, just ensure you have an arr of whatever
 * - if arguments, field is a field instance.
 *   For every value of arr given later on, field will be called with
 *   key as the indexed value on every value of the array 
 * @param  {[type]} field [description]
 * @param  min facultative, min length of array
 * @param  max facultative, max length of array 
 */
Field.prototype.arr = function(field, min, max){
    this.arrField = field || new Field({validateSchema:this.validateSchema});
    this.rules.push({
        arr:[
            rules.mandatory,
            Cutter.cut(rules.isArray),
            rules.minLength(min),
            rules.maxLength(max)
        ],
        ok:rules.anything
    });
    return this;
};

Field.prototype.bool = function(obj){
    this.rules.push({
        num:[
            rules.mandatory,
            Cutter.cut(rules.isBoolean)
        ],
        ok:rules.anything
    });
    return this;
};

Field.prototype.req = function(){
    this.rules.push(rules.mandatory);
    return this;
};

Field.prototype.enum = function(){
    var arr = [].slice.call(arguments);
    this.rules.push({
        num:[
            rules.mandatory,
            Cutter.cut(rules.oneOf(arr))
        ],
        ok:rules.anything
    });
    return this;
};
/**
 * you should call this after youve checked you have a string
 * @returns {string}
 */
Field.prototype.objId = function(){
    return this.str(24,24);
};

Field.prototype.sub = function(obj){
    this.subObj = obj;
    return this;
};

Field.prototype.func = function(f){
    this.rules.push(rules.func(f));
    return this;
};

/**
 * keyName being validated
 * obj: value to be validated
 * 
 * @return true or array of errors
 */
Field.prototype.validate = function(key, obj){
    var self = this;
    var res = ruler.andRules(this.rules, key, obj);
    var subErrors = [];
    if(ok(res)){
        //now validates nested lvls
        if(this.subObj){
            if(typeof(obj)!='undefined' && obj!=null){
                subErrors = this.validateSchema(this.subObj, obj);
            }
        }else if(this.arrField){
            if(typeof(obj)!='undefined' && obj!=null){

                var ref = Array.apply(null, Array(obj.length))
                    .reduce(function toObj(o, val, i){
                        o[i] = self.arrField;
                        return o;
                    }, {});
                var against = obj.reduce(function toObj(o, val, i){
                    o[i] = val;
                    return o;
                }, {});
                subErrors = this.validateSchema(ref, against);
            }
        }
    }
    
    return ok(res) && ok(subErrors) || res.concat(subErrors);
};

module.exports = Field;