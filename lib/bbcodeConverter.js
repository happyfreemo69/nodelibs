var bboxed = require('bboxed');
var Mocker = require('./mocker');
function oc(from,to){
    bboxed.addTag(from, {open: '<'+to+'>', close: '</'+to+'>'});
}
oc('i','em');
oc('b','strong');
oc('p','p');

//https://stackoverflow.com/questions/5499078/fastest-method-to-escape-html-tags-as-html-entities
//not the fastest but simplest
function escapeHtml(str){
    var tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };

    function replaceTag(tag) {
        return tagsToReplace[tag] || tag;
    }

    return str.replace(/[&<>]/g, replaceTag);
}
/**
 * [toHtml description]
 * @param  {[type]} str     [description]
 * @param  {html:false} options escapes html injection
 * @return {[type]}         [description]
 */
function toHtml(str, options = {}){
    str = str.replace(/\[\/?list\]/g,'');
    str = options.html === true?str:escapeHtml(str);
    var s = '';
    var lines = str.split(/\r?\n/g);
    for(var i = 0; i<lines.length; ++i){
        var x = lines[i];
        if(x.includes('[*]')){
            s += x + '\n';
        }else{
            s += x + '<br/>';
        }
    }
    if(str[str.length-1]!='\n'){//remove trailing br if unfortunate
        s = s.replace(/<br\/>$/,'');
    }
    return bboxed(s);
}

function validate(str){
    var mokr = new Mocker;
    var tmp = bboxed.Parser.prototype.parseInvalidTag;
    var failedAt = null;
    mokr.mock(bboxed.Parser.prototype, 'parseInvalidTag', function(token, tag){
        failedAt = token.tag;
        return tmp.apply(this, arguments);
    })
    var res = bboxed(str);
    mokr.unmockAll();
    return failedAt?'invalid bbcode (tag:'+failedAt+')':true;
}

module.exports = {
    toHtml: toHtml,
    validate: validate
};