function label(key, msg, val){
    return key+' '+msg+' ('+val+')';
}
var rules = {
    minNum:function(ref){
        return function(key,val){
            if(val < ref){
                return label(key,'length should be greater or equal than '+ref,val);
            }
            return true;
        }
    },
    maxNum:function(ref){
        return function(key,val){
            if(val > ref){
                return label(key,'length should be less or equal than '+ref,val);
            }
            return true;
        }
    },
    minLength:function(ref){
        return function(key,val){
            if(val.length < ref){
                return label(key,'length should be greater or equal than '+ref,val);
            }
            return true;
        }
    },
    maxLength:function(ref){
        return function(key,val){
            if(val.length > ref){
                return label(key,'length should be less or equal than '+ref,val);
            }
            return true;
        }
    },
    oneOf:function(choices){
        return function(key,val){
            if(choices.indexOf(val)==-1){
                return label(key,'not in '+choices.join('|'),val);
            }
            return true;
        }
    },
    anyNonWs:function(key, val){
        if(val.trim().length == 0){
            return label(key, 'empty string is not valid', val);
        }
        return true;
    },
    anything:function(){
        return true;
    },
    mandatory:function(key, val){
        if(typeof(val)===null || typeof(val)=='undefined'){
            return label(key, 'expects something', val);
        }
        return true;
    },
    isBoolean:function(key, val){
        if(typeof(val)!=='boolean'){
            return label(key, 'expects boolean', val);
        }
        return true;
    },
    isString:function(key,val){
        if(typeof(val)!=='string'){
            return label(key, 'expects string', val);
        }
        return true;
    },
    isArray:function(key,val){
        if(!(val instanceof Array)){
            return label(key, 'expects array', val);
        }
        return true;
    },
    isNumber:function(key,val){
        if(typeof(val)!=='number'){
            return label(key, 'expects number', val);
        }
        return true;
    },
    func:function(f){
        return function(key,val){
            return f(key,val);
        }
    }
};
module.exports = rules;