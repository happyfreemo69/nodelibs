var BPromise = require('bluebird');
function AsyncPromiseHandler(config){
    this.stack = [];
    this.stackContext = [];
}
AsyncPromiseHandler.prototype.set = function(k,v){
    if(k!=='stackEnabled'){throw 'expect key stackEnabled'}
    this.stackEnabled = !!v;
}

/**
 * does not clear unresolved promises
 * after this call those promises will be dangling promises
 */
AsyncPromiseHandler.prototype.clear = function(){
    //see https://stackoverflow.com/questions/29478751/how-to-cancel-an-emcascript6-vanilla-javascript-promise-chain
    this.stack = [];
    this.stackContext = [];
    this.DANGLING = Symbol('aphDangling');
    return true;
}
/**
 * In case a promise in the stack modify the stack itself..
 * it will wait for the stack to have been emptied
 * @return {[type]} [description]
 */
AsyncPromiseHandler.prototype.all = function(){
    var dequeue = _=>{
        var n = this.stack.length;
        return Promise.all(this.stack).then(x=>{
            if(this.stack.length != n){
                return dequeue();
            }
            return x;
        })
    }
    return dequeue();
}

AsyncPromiseHandler.prototype.hasResolved = function(){
    return Promise.resolve(this.stackContext.every(pCtx=>{
        return pCtx.state != this.DANGLING;
    }))
}
AsyncPromiseHandler.prototype.getStacks = function(){
    return this.stackContext.filter(x=>x.state==this.DANGLING).map(x=>{
        return x.location;
    })
}

var ap = new AsyncPromiseHandler;
module.exports = ap;

Object.defineProperty(ap, 'tail', {
    set: function(p){
        if(!(p instanceof Promise) && !p.then && !p.catch){
            if(!this.stackEnabled){
                throw new Error('must tail promises')
            }
            //silent error
            return false;
        }
        if(!this.stackEnabled){
            return p.catch(e=>{
                console.log(new Date, 'catch your errors..', e, e.stack);
            })
        }

        var o = {state:ap.DANGLING, location: (new Error).stack.split('\n').filter(x=>!x.includes('asyncPromiseHandler')&&x!='Error').slice(0,4)};

        var idx = this.stack.length;
        var that = this;
        var q = p.then((x)=>{
            o.state = 'ok';
            return x;
        }).catch((e)=>{
            o.state = 'ko';
            throw e;
        })
        this.stack.push(q);
        this.stackContext.push(o);
    }
});
