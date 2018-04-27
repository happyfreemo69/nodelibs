var jsonChecker = require('../../lib/jsonChecker');
var assert = require('assert');

var jsonSample = require('./buildingJsonChecker.json');
var jsonSecondSample = require('./anotherBuildingJsonChecker.json');

describe('jsonChecker', function(){

    it('should assert that keys match', function(){
        jsonChecker.checkKeys(jsonSample,jsonSecondSample);
        return;
    });
    it('should assert that links match', function(){
        jsonChecker.checkLinks(jsonSample.links,jsonSecondSample.links);
        jsonChecker.checkLinks(jsonSample.other_links,jsonSecondSample.other_links);
        return;
    });
    it('should compare jsons entirely', function(){
        jsonChecker.checkJson(jsonSample,jsonSecondSample);
        return;
    });

    it('should validate links with query param', function(){
        var jsonSampleLinks = {
            users:'https://lyyti-synty-mock.ngrok.com/v1/users/012345678901234567890123/stupids?buildingId=2d'
        };
        var jsonSecondSampleLinks = {
            users:'https://lyyti-synty-mock.ngrok.com/v1/users/012345678901234567890123/stupids?buildingId=2d'
        };
        jsonChecker.checkLinks(jsonSampleLinks, jsonSecondSampleLinks);
        return;
    });

    it('rejects if missing key', function(){
        assert.throws(()=>jsonChecker.checkJson({a:1},{b:1}), 'missing a in json(2nd arg)')
    });

    it('rejects if link fails', function(){
        try{
        jsonChecker.set('debug', false);
        jsonChecker.checkJson({links:{a:'/b'}},{links:{a:'/c'}});
        }catch(e){
            assert.equal(e.message, 'link fails (key=a)')
            return;
        }
        throw 'should have thrown';
    });

    it('should skip a link', function(){
        jsonChecker.checkJson({links:{a:'/b', c: '/d'}},{links:{a:'/b'}}, ['c']);
        return;
    });
});