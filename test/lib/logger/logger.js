var Logger = require('../../../lib/logger');

describe('logger',function(){
    it('http2 can instantiate', function(){
        var logger = new (Logger.http2)({}, {logLvl:1,logLineMaxSize:4096,
                lgs_processTimeout:1000,lgs_maxBlockSize:1049076,lgs_minFullLength:1,lgs_unlockAfter:1000});
        return true;
    })
})