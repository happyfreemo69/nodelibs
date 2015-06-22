var exports = module.exports;
var util = require('util');
var Promise = require('bluebird');


function RfError(o){
    this.details = o.details||'';
    this.message = o.message;
    this.statusCode = o.statusCode;
}
util.inherits(RfError, Error);

/**
 * [confRf description]
 * @param  {[type]} RF          [description]
 * @param  {[type]} config      [description]
 * @param  {{handleError:Error->Boolean}} cbks
 * @return {[type]}             [description]
 */
exports.confRf = function(RF, config, cbks){
    exports.rfErrorHandler = RF.Error({
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
    });

    exports.rfErrorHandler.setDebug = function(val){
        config.debug = val;
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


/************************************************************
    Handle different type of errors here
*************************************************************/
function MongooseError(str){
    this.statusCode = 409;
    this.message = str;
    this.stack = 'no traces for mongooseError, you want to grok for mongooseDup';
}
util.inherits(MongooseError, Error);

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

exports.noGrants = function(){
    return formatError({str:'no grants for #', statusCode:403}, arguments);
};

exports.reportUpdateStatusDenied = function(str, done){
    return formatError('current report not in opened status', arguments);
}

exports.noDupeForMultiChannel = function(){
    return formatError({str:'already an existing multi channel opened #', statusCode:409}, arguments);
}

exports.tooManyUsersInvolved = function(){
    return formatError('too many users involved', arguments);
}

exports.noDupeForSingleChannel = function(){
    return formatError({str:'already an existing single channel opened #', statusCode:409}, arguments);
}

exports.mongooseRequiredFields = function(str, done){
    return formatError({str:'expects field #', statusCode:500}, arguments);
}

exports.mongooseInvalidPropagation = function(str, done){
    return formatError('# is already bigger than #', arguments);
}

exports.noDupplicatedMails = function(str, done){
    return formatError({str:'no dupplicate mail allowed', statusCode:409}, arguments);
}

exports.noPastDateAllowed = function(str, done){
    return formatError('only futur monthly vote can be modified', arguments);
}

exports.noVoteExceptOnFirstOfMonth = function(str, done){
    return formatError('date should be first of a month #', arguments);
}

exports.invalidSyndic = function(){
    return formatError({str:'syndic given # whereas copro is from #', statusCode:403}, arguments);
};
exports.invalidCoproId = function(){
    return formatError({str:'invalid copro id #', statusCode:403}, arguments);
};

exports.noVoidZone = function(str, done){
    return formatError('can not post on voidzone', arguments);
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
exports.userDFwd = function(str,done){
    fwdError.apply(null, arguments);
}
exports.assetDFwd = function(str,done){
    fwdError.apply(null, arguments);
}
exports.invalidParent = function(){
    return formatError({str:'# invalid parent given : #'}, arguments);
}
exports.canNotChangeDuration = function(){
    return formatError({str:'You can not change startDate nor endDate of a FreemoVote'}, arguments);
}
exports.hasAlreadyVoted = function(){
    return formatError({str:'You have already voted for #'}, arguments);
}