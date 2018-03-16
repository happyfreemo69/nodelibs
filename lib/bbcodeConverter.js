var Parser = require('bbhtml');
var Mocker = require('./mocker');

/**
 * [toHtml description]
 * @param  {[type]} str     [description]
 * @param  {html:false} options escapes html injection
 * @return {[type]}         [description]
 */
function toHtml(str){
    var p = new Parser;
    return p.parse(str).html();
}

/**
 * @param  {[type]} str [description]
 * @return {true or string}     [description]
 */
function validate(str){
    var p = new Parser;
    try{
        p.parse(str);
        return true;
    }catch(e){
        return ''+e;
    }
}

module.exports = {
    toHtml: toHtml,
    validate: validate
};