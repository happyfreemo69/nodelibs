var Mocker = require('../../lib/mocker');
var assert = require('assert');
describe('mocker', function(){
    
    it('mocks an object', function(){
        var A = function(){this.p = 5}
        var mocker = new Mocker;
        var a = new A;
        mocker.mock(a,'p',2);
        assert.equal(a.p, 2);
        mocker.unmockAll();
        assert.equal(a.p,5);
    });

    it('several methods', function(){
        var A = function(){this.p = 5, this.f = ()=>'hello'}
        var mocker = new Mocker;
        var a = new A;
        mocker.mock(a,'p',2);
        mocker.mock(a,'f',()=>'ok');
        assert.equal(a.p, 2);
        assert.equal(a.f(), 'ok');
        mocker.unmockAll();
        assert.equal(a.p,5);
        assert.equal(a.f(),'hello');
    });

    it('mocks several objects', function(){
        var A = function(){this.p = 5}
        var B = function(){this.p = 10}
        var mocker = new Mocker;
        var a = new A;
        var b = new B;
        mocker.mock(a,'p',2);
        mocker.mock(b,'p',8);
        assert.equal(a.p, 2);
        assert.equal(b.p, 8);
        mocker.unmockAll();
        assert.equal(a.p,5);
        assert.equal(b.p,10);
    });


    var A = {p:5}
    it('mocks for it', Mocker.mockIt(function(mocker, done){
        mocker.mock(A,'p',2);
        assert.equal(A.p, 2);
        return done();
    }));

    it('the mock was previously fallbacked', Mocker.mockIt(function(mocker, done){
        assert.equal(A.p, 5);
        return done();
    }));

    it('mocks for it with promise', Mocker.mockIt(function(mocker){
        mocker.mock(A,'p',2);
        assert.equal(A.p, 2);
        return new Promise(function(resolve, reject){
            process.nextTick(function(){
                A.q = 1;  
                resolve();
            })
        })
    }));

    it('mocks for it with promise properly synchronized', Mocker.mockIt(function(mocker){
        mocker.mock(A,'p',2);
        assert.equal(A.p, 2);
        assert.equal(A.q, 1);
        return Promise.resolve();
    }));

    var B = {}
    it('mocks with pre', Mocker.mockIt(function(mocker){
        mocker.pre(x=>{
            B.p = 3;
        }).pre(x=>{
            B.q = 5;
        }).aft(x=>{
            B.p = 2;
            B.q = 4;
        })
    }));

    it('has called aft after test is ok', function(){
        assert.equal(B.p, 2)
        assert.equal(B.q, 4)
    })
});