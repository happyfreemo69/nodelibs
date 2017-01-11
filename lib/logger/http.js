var fs = require('fs');
var util = require('util');
var http = require('http');

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
Logger.prototype.format = function(lvl, s){
    var d = new Date();
    var date = twoDigits(d.getDate())+'/'+twoDigits(d.getMonth()+1)+'/'+(''+d.getFullYear()).substring(2);
    date += '_'+twoDigits(d.getHours())+':'+twoDigits(d.getMinutes())+':'+twoDigits(d.getSeconds());
    date += '.'+ ('00'+d.getMilliseconds()).substr(-3);
    var dom = this.logDomain();
    var head = '['+lvl+']'+[date].concat(dom).join('|');
    return head+'>'+s.substring(0, this.config.logLineMaxSize);
};


Logger.prototype._write = function(s){
    var req = http.request({
        method:'POST',
        path:'/'+this.options.appName,
        hostname:this.options.host,
        port:this.options.port,
        headers:{
            'content-length': s.length,
            'content-type':'application/text'
        }
    });
    req.write(s);
}
Logger.prototype._log = function(lvl, s){
    if(this.lvls[lvl] >= this.config.logLvl){

        var str = this.format(lvl, s);
        if(this.config.logToConsole){
            console.log(str);
        }
        this._write(str);
    }
};
module.exports = Logger;