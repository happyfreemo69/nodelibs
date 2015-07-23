var exports = module.exports;
var util = require('util');
var Promise = require('bluebird');


function RfError(o){
    this.details = o.details||'';
    this.message = o.message;
    this.statusCode = o.statusCode;
}
util.inherits(RfError, Error);


/************************************************************
    Handle different type of errors here
*************************************************************/
function MongooseError(str){
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
 * @return {[type]}      [description]
 */
function formatError(o, args){
    var statusCode = 400;
    var str;
    if(typeof(o)=='string'){
        str = o;
    }else{
        str = o.str;
        statusCode = o.statusCode||statusCode;
    }
    var error = new RfError({
        statusCode:statusCode,
        message: str
    });

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
    try{
        var json = JSON.parse(str);
        error = new RfError({statusCode:json.code, message: json.error, details:json.error_description});
    }catch(e){
        error = new RfError({statusCode:500, message: 'assetD said: '+str});
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
            if(e.message.indexOf('INVALID_PARAMETERS')!=-1){
                config.logger.inf(e.stack);
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
    return formatError({str:'# not found (#)', statusCode:404}, arguments);
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
    return formatError({str:'no grants for #', statusCode:403}, arguments);
};

exports.userDFwd = function(str,done){
    fwdError.apply(null, arguments);
}
exports.assetDFwd = function(str,done){
    fwdError.apply(null, arguments);
}