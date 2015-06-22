var util = require('util');
var _ = require('lodash');
var Promise = require('bluebird');
var subscribers = {};
var count = 0;
function Queue(){
    this.events = [];
}

Queue.prototype.has = function(eventName, instance){
    if(!this.events.hasOwnProperty(eventName)){
        return false;
    }
    return this.events[eventName].indexOf(instance) != -1;
}

Queue.prototype.add = function(eventName, instance){
    if(!this.events.hasOwnProperty(eventName)){
        this.events[eventName] = [];
    }
    this.events[eventName].push(instance);
}

Queue.prototype.toString = function(){
    var res = Object.keys(this.events).map(function(eventName){
        var o = this.events[eventName].map(function(instance){
            return instance.constructor;
        }).join('|');
        return o;
    }, this);
    return res.join(';');
}

/**
 * [Destroyer description]
 * @param {logger:{err:func}} config [description]
 */
function Destroyer(config){
    this.config = config;
    this.trxId = Date.now()+'_'+(count++);
    this.queue = new Queue();
};
Destroyer.clear = function(){
    subscribers = {};
}
/**
 * [subscribe description]
 * @param  {[type]} eventName [description]
 * @param  {(publisherInstance, destroyer)} func      inside the subscribe function, you must use the destroyer to acknowledge propagation
 * @return {[type]}           [description]
 */
Destroyer.subscribe = function(eventName, func){
    subscribers[eventName] = subscribers[eventName] || [];
    subscribers[eventName].push(func);
}
Destroyer.unsubscribe = function(eventName, func){
    if(!subscribers.hasOwnProperty(eventName)){return true;}
    subscribers[eventName] = subscribers[eventName].filter(function(x){
        return x!=func;
    })
}
/**
 * [publish description]
 * @param  {[type]} eventName [description]
 * @param  {[type]} instance  [description]
 * @return {Promise}          
 */
Destroyer.prototype.publish = function(eventName, instance){
    var self = this;
    if(this.queue.has(eventName, instance)){
        //prevent cycle
        return Promise.reject('cycle detected:'+this.queue.toString())
    }
    this.queue.add(eventName, instance);
    var self = this;
    var dfds = (subscribers[eventName]||[]).map(function(func){
        return func(instance, self);
    });
    return Promise.all(dfds).then(function(){return instance;}).catch(function(e){
        self.config.logger.err('fail to dispatch properly ', e);
        return Promise.reject(e);
    })
}

Destroyer.publish = function(config, eventName, instance){
    var dest = new Destroyer(config, eventName, instance);
    return dest.publish(eventName, instance);
}
module.exports = Destroyer;
