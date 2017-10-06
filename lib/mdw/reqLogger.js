//copy pasted from morgan
function getip(req) {
  return req.ip
    || req._remoteAddress
    || (req.connection && req.connection.remoteAddress)
    || undefined;
}
function escapeBody(body){
    if(typeof(body)=='string'){
        try{
            body = JSON.parse(body);
        }catch(e){
            body = {};
        }
    }
    var bodyLog = Object.keys(body).reduce(function(acc, x){
        acc[x] = body[x];
        return acc;
    },{}) || {};
    ['password', 'old_password', 'oldPassword'].forEach(function(x){
        if(x in body){
            bodyLog[x] = '__hidden';
        }
    })
    return bodyLog;
}
module.exports = function(config){
    var onStart = function(req, res, next){
        var osHeader = "os_unknown";
        if(req.headers && req.headers.os){
            osHeader = req.headers.os.substring(0,20).replace(/ /g,'_');//#issue/4012
        }
        req._bodyLog = escapeBody(req.body||{});
        config.logger.inf('REQUEST', req.method, osHeader ,req.url, JSON.stringify(req._bodyLog), getip(req));
        req.startedTime = Date.now();
        if(config.hot.reqToStdout){
            console.log(req.method, req.url);
        }
        next();
    }

    //we could use domain to identifiate user, but a too much coupling
    var onAuthUser = function(req, res){
        config.logger.inf('REQAUTH', req.method, req.url, JSON.stringify(req._bodyLog), getip(req));
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
                config.logger.sta('BIGREQ', elapsed, 'ms', req.method, req.url, JSON.stringify(req._bodyLog), getip(req));
            }

            config.logger.sta('REQURL', req.method, req.url, elapsed, 'ms');
            config.logger.inf('RESPONSE', arguments[0]);
            if(this.statusCode < 200 || this.statusCode > 299){
                var e = new Error;
                config.logger.sta('RESERR', arguments[0], e.stack);
            }
            res._monkeyPatchSend.apply(res, arguments);
        }
    }
}
