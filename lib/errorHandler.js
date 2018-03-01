var exports = module.exports;
var util = require('util');
var Promise = require('bluebird');
/**
 * all errors must have an id.
 * This id is used to identify the error for api clients.
 * By default : 
 * 0 is returned for RfError
 * 1 is returned for 404
 * 2 is returned for mongoose
 * 
 * It is very likely to be an internal error
 * NodeLibs is using the range 10-100
 * Do not use this range
 * 
 * We are not meant to have many errors. An integer will do. Shall we need more errors
 * we will use a different process to map ids, namespaces and errors. So far keep it easy
 *
 * You may find the list of errors in 
 * https://docs.google.com/spreadsheets/d/1GPBRPv12QlisWFp6P5flmVeXWqIkWA3Lt3S0Tsmcpt4/edit#gid=0
 */

function RfError(o){
    for(i in o){
        this[i] = o[i];
    }
    this.details = this.details||'';
    this.id = this.id || 0;
}
util.inherits(RfError, Error);


/************************************************************
    Handle different type of errors here
*************************************************************/
function MongooseError(str){
    this.id = 2;
    this.statusCode = 409;
    this.message = str;
    this.stack = 'no traces for mongooseError, you want to grok for mongooseDup';
}
util.inherits(MongooseError, Error);


/**
 * formats an error compatible to RF
 * @param  {[type]} o    str or object
 *  if object, object = {
 *    str:'error # #',
 *    statusCode:400 (default)
 *  }
 * @param  {[type]} args = [
 *   tokens to be put in place of #
 *   if last args is a function, last arg is called
 * ]
 * @param {[{id:..., whatever:..}]} specifics an object which will be directly copied to the response (facultative)
 * @return {[type]}      [description]
 */
function formatError(o, args, specifics){
    var statusCode = 400;
    var id = 0;
    var str;
    if(typeof(o)=='string'){
        str = o;
    }else{
        str = o.str;
        statusCode = o.statusCode||statusCode;
        id = o.id||id;
    }
    var basicError = {
        id:id,
        statusCode:statusCode,
        error:str,
        message: str,
        fwdedError:true,
        date: new Date()
    }
    if(specifics){
        for(var i in specifics){
            basicError[i] = specifics[i];
        }
    }
    var error = new RfError(basicError);

    if(args.length == 0){
        return Promise.reject(error);    
    }
    var params = Array.prototype.slice.apply(args).splice(0);
    var done = params.pop();
    if(typeof(done) != 'function'){
        params.push(done);
    }
    params.forEach(function(val){
        error.message = error.message.replace('#', val);
    })
    
    if(typeof(done)=='function'){
        return done(error);
    }
    return Promise.reject(error);
}

function fwdError(str, done){
    var error;
    var json = {};
    try{
        var json = JSON.parse(str);
        error = json;
        error.fwdedError = true;
        /* awaiting #1794
        error = new RfError({statusCode:json.statusCode, 
            message: json.error||json.errors.join(','),
            details:json.error_description||json.details||json.messages||json.errors||'' //good job userD
        });*/
    }catch(e){
        error = new RfError({statusCode:500, id: json.id||0, message: str, details:'assetD rejection'});
    }
    if(typeof(done)=='function'){
        return done(error);
    }
    return Promise.reject(error);
}


var rfOptions = null;
/**
 * [confRf description]
 * @param  {[type]} RF          [description]
 * @param  {[type]} config      [description]
 * @param  {{handleError:Error->Boolean}} cbks
 * @return {[type]}             [description]
 */
exports.confRf = function(RF, config, cbks){
    if(rfOptions){
        throw 'WARN you are trying to instantiate multiple instances of Rf..'
    }
    var rfOptions = {
        debug:config.debug,
        onError:function(e){
            config.logger.inf(JSON.stringify(e));
            if(!e.message || !e.message.includes('INVALID_PARAMETERS')){
                config.logger.inf('nodelibs::',e.stack);
            }
        },
        /**
         * must return true if error is to be handled
         * if you are returning true, mapError is expected to exist
         * @param  {error} handleError [description]
         */
        handleErrorFormatting: cbks.handleError,
        /**
         * @return {
         *   statusCode:400,
         *   json:"rest"
         * }
         */
        mapError:function(e){
            if(e.name == 'MongoError' && e.code==11000){
                return new RfError({
                    details:'record already exists',
                    message:'record already exists',
                    statusCode:409
                })
            }
            var str = Object.keys(e.errors).map(function(key){
                var err = e.errors[key];
                return err.message + '('+err.value+')';
            }).join('\n');
            return new RfError({
                details:e,
                message:str,
                statusCode:400
            })
        }
    }
    this.rfErrorHandler = RF.Error(rfOptions);

    this.rfErrorHandler.setDebug = function(val){
        rfOptions.debug = false;
    }

}

exports.RfError = RfError;

/**
 * @param {string} type should be ressource name
 * @param {string} id should be id of ressource we failed to retrieve
 * @returns {Function}
 */
exports.ifNotFound = function(type, id){
    return function(res){
        if(res === null || typeof(res) === 'undefined' || res instanceof Array && res.length == 0){
            return exports.notFound(type, id);
        }
        return Promise.resolve(res);
    }
};


exports.notFound = function(){
    return formatError({str:'# not found (#)', statusCode:404, id:1}, arguments);
}

exports.mongooseDup = function(str, done){
    var error = new MongooseError(str);
    done(error);
};

exports.mongooseDefault = function(str, done){
    var err = new MongooseError(str);
    err.statusCode = 500;
    if(done)return done(err);
    return Promise.reject(err);
}

exports.formatError = formatError;
exports.noGrants = function(){
    return formatError({str:'no grants for #', statusCode:403, id:3}, arguments);
};

exports.userDFwd = function(str,done){
    fwdError.apply(null, arguments);
}
exports.syntyFwd = function(str,done){
    fwdError.apply(null, arguments);
}
exports.assetDFwd = function(str,done){
    fwdError.apply(null, arguments);
}
exports.invalidParameters = function(o,done){
    return formatError({str:'INVALID_PARAMETERS', statusCode:400, id:4}, arguments, o);
}