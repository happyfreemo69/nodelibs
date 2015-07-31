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
            config.logger.inf('RESPONSE', arguments[0]);
            res._monkeyPatchSend.apply(res, arguments);
        }
    }
}
