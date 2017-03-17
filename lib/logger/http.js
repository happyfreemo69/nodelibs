var fs = require('fs');
var util = require('util');
var http = require('http');
var slack = require('../slackNotifier');
/**
 * [Logger description]
 * @param {[type]} options {
 *   host: mandatory 
 *   port: mandatory
 *   appName: synty
 * }
 * @param {[type]} config  {
 *   logLvl:3 //expects a number, if 0 it means everything is log, if 3, only CRITical errors are log
 *   logLineMaxSize:2 //line will be truncated if size superior
 *   lgs_socketRecycleTime: 100 //ms: time before attempting a reconnection
 *   lgs_maxRetries: 5 //will retry after 100, 200, 300, 400, 500 ms (min value == 0)
 *   lgs_timeoutBeforeRetry: 1000 (retry every second)
 * }
 *
 * DBG: junk (dev purpose)
 * INF: get info, trace routes
 * ERR: anormal path, portions of code which should never be reached
 * CRI: technical anormal behaviour (cant connect to db, etc)
 */
function Logger(options, config){
    var self = this;
    this.options = options;
    this.lvls = ['DBG', 'STA', 'INF', 'ERR', 'CRI'].reduce(function(o,k,i){o[k]=i;return o;}, {});
    this.config = config;
    if(!config.hasOwnProperty('logLvl')){
        throw 'expect a logLvl in config';
    }
    if(!config.hasOwnProperty('lgs_socketRecycleTime')){
        throw 'expect a lgs_socketRecycleTime in config';
    }
    if(!config.hasOwnProperty('lgs_maxRetries')){
        throw 'expect a lgs_socketRecycleTime in config';
    }
    this.stack = [];
    this.isLocked = false;
    this.lastOkConnection = 0;
    this.lastRetryAttempt = 0;
}
Logger.prototype.write = function(s){
    var s = util.format.apply(console, arguments);
    this._log('INF', s);
}

Logger.prototype.dbg = function(){
    var s = util.format.apply(console, arguments);
    this._log('DBG', s);
};

Logger.prototype.inf = function(){
    var s = util.format.apply(console, arguments);
    this._log('INF', s);
};

Logger.prototype.err = function(){
    var s = util.format.apply(console, arguments);
    this._log('ERR', s);
};

Logger.prototype.cri = function(){
    var s = util.format.apply(console, arguments);
    this._log('CRI', s);
};

Logger.prototype.sta = function(){
    var s = util.format.apply(console, arguments);
    this._log('STA', s);
};

Logger.prototype.logDomain = function(){
    if(process.domain){
        return ['TRX:'+process.domain.id, 'USR:'+(process.domain && process.domain.ctx?process.domain.ctx.userId:'nouser')];
    }
    return 'noctx';
};
function twoDigits(s){
    return ('0'+s).substr(-2);
}
Logger.prototype.format = function(s){
    return s.substring(0, this.config.logLineMaxSize);
};

Logger.prototype.formatHeaders = function(lvl, s){
    var o = process.domain && process.domain.ctx || {};
    var h = {
        'content-length': Buffer.byteLength(s),
        'content-type':'application/text',
        'lvl': lvl,
        'ts': Date.now()
    };
    ['pfx', 'sid', 'tid', 'uid'].forEach(x=>{
        if(o[x]){
            h[x] = o[x]
        }
    })
    return h;
};

/**
 */
Logger.prototype.reconnect = function(nbAttempts){
    var self = this;
    if(!self.isConnecting){
        self.isConnecting = true;
        setTimeout(function(){
            if(self.stack.length){
                var [s, headers] = self.stack.shift();
            }else{
                var s = 'reconnection';
                headers = 'noheader';
            }
            self.now = Date.now();
            console.log('reco :', self.now, self.config.lgs_socketRecycleTime*nbAttempts);
            self._write(s, headers, nbAttempts);
        }, self.config.lgs_socketRecycleTime*nbAttempts);//gives the socket enough time to be closed, arbitrarily set
    }
}
//https://github.com/nodejs/node/pull/2534
Logger.prototype._write = function(s, headers, nbAttempts=0){
    var self = this;
    var now = Date.now();
    var req = http.request({
        method:'POST',
        path:'/'+this.options.appName,
        hostname:this.options.host,
        port:this.options.port,
        headers:headers
    }, function(res){
        res.on('data', function(){
            self.lastOkConnection = Date.now();
            self.isConnecting = false;
            self.isLocked = false;
        });
    });
    req.on('error', e => {
        //multiple para requests may have failed
        //here maybe the socket has been successfully reconnected
        //in which case you dont want to reset a timeout but just relog
        //first cond ensure connection may have been established
        //second cond ensure even if it was established it has not been lost meanwhile
        if(now<self.lastOkConnection && !self.isLocked){
            console.log('dequeue', now, self.lastOkConnection);
            return self._write(s, headers, nbAttempts+1);
        }
        self.isLocked = true;
        self.lastLock = Date.now();
        self.stack.push([s, headers])
        if(nbAttempts == self.config.lgs_maxRetries){
            console.log(new Date, 'nodelibs http failed ', e);
            slack.notify((new Date)+self.options.appName+'> lgs is down');
            return;
        }
        //in basic logging WE are the one who close the stream
        //here the remote closes the stream
        self.reconnect(nbAttempts+1);
    })
    req.write(s);
    req.end();
}

Logger.prototype._log = function(lvl, s){
    var self = this;
    if(this.lvls[lvl] >= this.config.logLvl){

        var str = this.format(s);
        var headers = this.formatHeaders(lvl, s);
        if(this.config.logToConsole){
            console.log(str);
        }

        if(this.isLocked){
            if(Date.now() - self.lastRetryAttempt > self.config.lgs_timeoutBeforeRetry){
                console.log(new Date,'retry');
                self.lastRetryAttempt = Date.now();
                //forces the reconnection
                self.isConnecting = false;
                return self.reconnect(1);
            }
            if(self.binarySize > self.config.logMaxFileSize){
                slack.notify((new Date)+self.options.appName+'LOST LOGS');
                console.log(new Date, 'STACK TOO BIG', self.binarySize, self.stack.length);
                self.stack = [];
                self.binarySize = 0;
                return;
            }
            this.binarySize += str.length;
            return this.stack.push([str, headers]);
        }
        this.binarySize = 0;
        //since we are not locked anymore, idem connected, dequeue stack
        self.stack.push([str, headers])
        while(self.stack.length){
            var x = self.stack.pop();
            var [s, headers] = x;
            if(self.isLocked){
                console.log('failing more than queuing=>losing logs');
                self.stack = [];
            }
            self._write(s, headers);
        }
    }
};
module.exports = Logger;