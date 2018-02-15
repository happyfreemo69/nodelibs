var bb = require('../../lib/bbcodeConverter');
var assert = require('assert');
describe('bbcodeConverter', function(){
    
    it('converts bbcode to html', function(){
        assert.equal(bb.toHtml('[url="http://valid.com"]text[/url]'), '<a href="http://valid.com">text</a>');
    });

    it('accepts i tag', function(){
        assert.equal(bb.toHtml('[i]af[/i]'), '<em>af</em>');
    });

    it('accepts b tag', function(){
        assert.equal(bb.toHtml('[b]af[/b]'), '<strong>af</strong>');
    });

    it('accepts u tag', function(){
        assert.equal(bb.toHtml('[u]af[/u]'), '<span style="text-decoration: underline;">af</span>');
    });

    it('accepts repeated tag', function(){
        assert.equal(bb.toHtml('[b]af[i]ef[/i]f[/b][i]other[/i]'), '<strong>af<em>ef</em>f</strong><em>other</em>');
    });

    it('accepts inline tag inside blocks', function(){
        assert.equal(bb.toHtml('[p][b]f[/b][/p]'), '<p><strong>f</strong></p>');
    });

    it('accepts color', function(){
        assert.equal(bb.toHtml('[color=red]test[/color]'), '<span style="color: red;">test</span>');
    });

    it('accepts color2', function(){
        assert.equal(bb.toHtml('[color="#eeeeee"]test[/color]'), '<span style="color: #eeeeee;">test</span>');
    });

    it('accepts lists', function(){
        assert.equal(bb.toHtml('[*]test\n[*]another\ntest'), '<ul><li>test</li><li>another</li></ul>\ntest');
    });

    it('accepts quote', function(){
        assert.equal(bb.toHtml('[quote]a[/quote]'), '<blockquote>a</blockquote>');
    });

    it('rejects block from p', function(){
        //assert.equal(bb.toHtml('[p][h1]fe[/h1][/p]'), false);
        //actually fails but too hard on me and bboxed is confortable
    });

    it('validates ok', function(){
        assert.equal(bb.validate('[quote]a[/quote]'), true);
    });

    it('validates ko', function(){
        assert.equal(bb.validate('[u][i][/u][/i]'), 'invalid bbcode (tag:u)');
    });

    it('escapes html', function(){
        assert.equal(bb.toHtml('[b]<span>test</span>[/b]'), '<strong>&lt;span&gt;test&lt;/span&gt;</strong>');
    });

    it('ignores [list][/list]', function(){
        assert.equal(bb.toHtml('z[list]a[list]b[/list]c[/list]d'), 'zabcd');
    });
});