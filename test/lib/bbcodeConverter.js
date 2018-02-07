var converter = require('../../lib/bbcodeConverter');
var assert = require('assert');
describe('bbcodeConverter', function(){
    
    it('converts bbcode to html', function(){
        var res = converter.toHtml('[h1]This is going to be a [b]LONG[/b] string.[/h1] [p] Let us [b]add[/b] a [url]www.square-tempest.com[/url][txt]link[/txt] shall we?[/p]');
        assert.equal(res,'<h1>This is going to be a <strong>LONG</strong> string.</h1> <p> Let us <strong>add</strong> a <a href="www.square-tempest.com">link</a> shall we?</p>');
    });

});