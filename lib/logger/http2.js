var fs = require('fs');
var util = require('util');
var http = require('http');
var SlackNotifier = require('../slackNotifier');
var LogProc = require('./logProc');
/**
 * [Logger description]
 * @param {[type]} options {
 *   host: mandatory 
 *   port: mandatory
 *   appName: synty
 * }
 * @param {[type]} config  {
 *   logLvl:3 //expects a number, if 0 it means everything is log, if 3, only CRITical errors are log
 *   logLineMaxSize:10000 //10k bytes max
 *   slack_webhookUrl: http://... facultative to receive notification when failure
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
    ['logLvl', 'logLineMaxSize', 'lgs_processTimeout', 'lgs_maxBlockSize', 'lgs_minFullLength', 'lgs_unlockAfter'].forEach(x=>{
        if(!config.hasOwnProperty(x)){
            throw 'expect a '+x+' in config';
        }    
    })
    if(config.slack_webhookUrl){
        this.slack = new SlackNotifier(config.slack_webhookUrl);
    }
    this.logProc = new LogProc({
        processTimeout:config.lgs_processTimeout,
        maxBlockSize:config.lgs_maxBlockSize,
        minFullLength:config.lgs_minFullLength,
        unlockAfter:config.lgs_unlockAfter,
        tickEvery: config.lgs_tickEvery,
        dequeue:this._dequeue.bind(this),
        onFail:()=>{
            self.slack && self.slack.notify((new Date)+self.options.appName+'> lgs is down');
        }
    })
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

//https://github.com/nodejs/node/pull/2534
Logger.prototype._dequeue = function(tasks, cbk){
    var self = this;
    var req = http.request({
        method:'POST',
        path:'/'+this.options.appName+'/bulks',
        hostname:this.options.host,
        port:this.options.port
    }, function(res){
        res.on('data', function(){
            return cbk(null);
        });
    });
    req.on('error', e => {
        return cbk(e);
    })
    req.on('timeout', function(){
        req.abort();
        return cbk(e);
    })
    req.write(JSON.stringify(tasks.map(x=>{
        return {body:x[0], headers:x[1]}
    })));
    req.end();
}

Logger.prototype._log = function(lvl, s){
    var self = this;
    if(this.lvls[lvl] >= this.config.logLvl){

        var str = this.format(s);
        var headers = this.formatHeaders(lvl, str);
        if(this.config.logToConsole){
            console.log(str);
        }

        return self.logProc.write([str,headers]);
    }
};
Logger.prototype.destroy = function(){
    return this.logProc.destroy();
}
module.exports = Logger;