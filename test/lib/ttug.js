var Ttug = require('../../').Ttug;
var assert = require('assert');
var Mocker = require('../../lib/mocker');
describe('lib ttug', function(){

    it('match default star[1]', Mocker.mockIt(function(mokr){
        var ttug = new Ttug(3);
        ttug.push('bob', '*', 'dev')
        ttug.push('bob', 'random', 'dev');
        return ttug.ensureEntry('bob', 'test', 'dev').then(entry=>{
            assert.equal(entry[0], 'bob');
            assert.equal(entry[1], '*');
            assert.equal(entry[2], 'dev');
        })
    }));

    it('match default star[2]', Mocker.mockIt(function(mokr){
        var ttug = new Ttug(3);
        ttug.push('bob', 'a', 'b')
        ttug.push('bob', '*', '*');
        return ttug.ensureEntry('bob', 'test', 'uat').then(entry=>{
            assert.equal(entry[0], 'bob');
            assert.equal(entry[1], '*');
            assert.equal(entry[2], '*');
        })
    }));

    it('match overrides star[1]', Mocker.mockIt(function(mokr){
        var ttug = new Ttug(3);
        ttug.push('bob', '*', 'dev')
        ttug.push('bob', 'test', 'dev');
        return ttug.ensureEntry('bob', 'test', 'dev').then(entry=>{
            assert.equal(entry[0], 'bob');
            assert.equal(entry[1], 'test');
            assert.equal(entry[2], 'dev');
        })
    }));

    it('match overrides star[2]', Mocker.mockIt(function(mokr){
        var ttug = new Ttug(3);
        ttug.push('bob', '*', 'dev')
        ttug.push('bob', 'test', '*');//stronger because of [1]
        return ttug.ensureEntry('bob', 'test', 'dev').then(entry=>{
            assert.equal(entry[0], 'bob');
            assert.equal(entry[1], 'test');
            assert.equal(entry[2], '*');
        })
    }));

    it('builds from string:: match overrides star[2]', Mocker.mockIt(function(mokr){
        var ttug = Ttug.fromString(`
            bob;*;dev
            bob;test;*
        `);
        return ttug.ensureEntry('bob', 'test', 'dev').then(entry=>{
            assert.equal(entry[0], 'bob');
            assert.equal(entry[1], 'test');
            assert.equal(entry[2], '*');
        })
    }));
});
