//copy pasted from morgan
function getip(req) {
  return req.ip
    || req._remoteAddress
    || (req.connection && req.connection.remoteAddress)
    || undefined;
}

module.exports = function(config){
    var onStart = function(req, res, next){
        config.logger.inf('REQUEST', req.method, req.url, JSON.stringify(req.body), getip(req));
        req.startedTime = Date.now();
        if(config.hot.reqToStdout){
            console.log(req.method, req.url);
        }
        next();
    }

    //we could use domain to identifiate user, but a too much coupling
    var onAuthUser = function(req, res){
        config.logger.inf('REQAUTH', req.method, req.url, JSON.stringify(req.body), getip(req));
        if(config.hot.reqToStdout){
            console.log(req.method, req.url);
        }
    }
    
    return function(req, res, next){
        req.onAuthUser = onAuthUser.bind(null, req,res);
        onStart.call(null, req, res, next);
        res._monkeyPatchSend = res.send;
        res.send = function(){
            var elapsed = Date.now() - req.startedTime;
            if(config.hot.maxRequestTime && elapsed > config.hot.maxRequestTime){
                config.logger.sta('BIGREQ', elapsed, 'ms', req.method, req.url, JSON.stringify(req.body), getip(req));
            }
            config.logger.inf('RESPONSE', arguments[0]);
            if(this.statusCode < 200 || this.statusCode > 299){
                config.logger.sta('RESERR', arguments[0]);
            }
            res._monkeyPatchSend.apply(res, arguments);
        }
    }
}
