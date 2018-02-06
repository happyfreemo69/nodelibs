var assert = require('assert');
var APH = require('../../lib/asyncPromiseHandler');
var BP = require('bluebird');


function customSetTimeout(fn, timeout, timeoutObj={}){
    return new Promise(function(resolve, reject){
        var t = setTimeout(function(){
            var p = fn();
            if(!p || (!p.then && !p.catch)){return resolve(p)}
            p.then(resolve).catch(reject);
        }, timeout);
        timeoutObj.rw = t;
        return t;
    });
};
describe('asyncPromiseHandler', function(){

    it('can stack promises', function(){
        APH.set('stackEnabled', true);
        APH.tail = Promise.resolve(1);
        APH.tail = BP.resolve(2);
        return APH.all().then(function([a,b]){
            assert.equal(a+b, 3);
        })
    });

    it('throws if invalid promise stacked', function(){
        APH.set('stackEnabled', true);
        APH.tail = Promise.resolve(1);
        try{
            APH.tail = 2;
        }catch(e){
            assert(e.toString().includes('must tail promises'));
            return;
        }
        throw new Error('should have thrown');
    });

    it('no throw if stack disabled', function(){
        APH.set('stackEnabled', false);
        APH.tail = 2;
        //THIS SHOULD NOT THROW: PROD MOD
    });

    it('isResolved as false if one of promise has not resolved yet', function(){
        APH.set('stackEnabled', true);
        APH.tail = customSetTimeout(function(){
            return 'ok';
        }, 20);
        return APH.hasResolved().then(function(x){
            assert(!x, 'dangling cbk');    
        })
    });

    it('isResolved as true if all promises have resolved', function(){
        APH.set('stackEnabled', true);
        var called = false;
        APH.tail = customSetTimeout(function(){
            called = true;
            return 'ok';
        }, 0);
        return APH.all().then(()=>{
            return APH.hasResolved().then(function(x){
                assert(x, true);
            })
        })
    });

    it('empties the stack when clear called', function(){
        APH.set('stackEnabled', true);
        var called = false;
        APH.tail = customSetTimeout(function(){
            called = true;
            return 'ok';
        }, 0);
        APH.clear();
        assert.equal(APH.stack.length, 0);
    })
});
