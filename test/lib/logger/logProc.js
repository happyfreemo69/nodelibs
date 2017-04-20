var LogProc = require('../../../lib/logger/logProc');
var assert = require('assert');

describe('logProc',function(){
    it('chains block', function(){
        var lp = new (LogProc)({}, {logLvl:1,logLineMaxSize:4096,
                lgs_processTimeout:1000,lgs_maxBlockSize:1049076,lgs_minFullLength:1,lgs_unlockAfter:1000});
        var b = lp.currentBlock;
        lp.chainBlock();
        assert(lp.blocks[0] == b);
        assert.equal(lp.blocks.length, 2);
        assert.equal(lp.currentBlock, lp.blocks[1]);
    })

    it('unchains block if 1 block', function(){
        var lp = new (LogProc)({}, {logLvl:1,logLineMaxSize:4096,
                lgs_processTimeout:1000,lgs_maxBlockSize:1049076,lgs_minFullLength:1,lgs_unlockAfter:1000});
        var b = lp.currentBlock;
        lp.shiftBlock();
        assert(lp.blocks[0] != b);
        assert.equal(lp.blocks.length, 1);
        assert.equal(lp.currentBlock, lp.blocks[0]);
    })

    it('unchains block if 2 block', function(){
        var lp = new (LogProc)({}, {logLvl:1,logLineMaxSize:4096,
                lgs_processTimeout:1000,lgs_maxBlockSize:1049076,lgs_minFullLength:1,lgs_unlockAfter:1000});
        var b = lp.currentBlock;
        lp.chainBlock();
        var b2 = lp.currentBlock;
        lp.shiftBlock();
        assert(lp.blocks[0] == b2);
        assert.equal(lp.currentBlock, lp.blocks[0]);
        assert.equal(lp.blocks.length, 1);
    })
})    
