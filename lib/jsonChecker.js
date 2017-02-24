var assert = require('assert');
var querystring = require('querystring');
var DEBUG = true;
function checkKeys(jsonRef, json, prefix){
    var s = new Set(Object.keys(jsonRef).concat(Object.keys(json)));
    [...s].forEach(x=>{
        assert(x in jsonRef, prefix+' missing '+x+' in jsonRef(1st arg)');
        assert(x in json, prefix+' missing '+x+' in json(2nd arg)');
    })
}

function checkLinks(linksRef, linksTest){
    checkKeys(linksRef, linksTest, 'linksLevel:');
    Object.keys(linksRef).forEach(function(link){
        var x = compareLink(linksRef[link], linksTest[link]);
        if(!x && DEBUG){
            console.log('1arg: '+link+'->'+linksRef[link])
            console.log('2arg: '+link+'->'+linksTest[link])
        }
        assert(x, 'link fails (key='+link+')');
    });
}

function checkJson(jsonRef, json){
    checkKeys(jsonRef, json);
    jsonRef.links && checkLinks(jsonRef.links, json.links);
}

function isObjectId(string){
    return string.match(/^[0-9a-f]{24}$/);
}

/**
 * @param  {string} ref  query=test&bob=2
 * @param  {string} test query=test&bob=2&page=3
 * @return true if all query key params of refQuery are present in refTest 
 */
function areParamsOkay(ref, test){
    var refQuery = querystring.parse(ref);
    var refTest = querystring.parse(test);

    return Object.keys(refQuery).every(function(key){
        //http://stackoverflow.com/questions/16585209/node-js-object-object-has-no-method-hasownproperty
        return Object.prototype.hasOwnProperty.call(refTest, key);
    });
}

/**
 * @param  {[type]} str link of the form http://v1/whatever?someParams...
 * 
 * left part is a string: everything starting with /v1/ and before '?', rightPart, everything after '?'
 * @return {{leftPart, rightPart}}     
 */
function decomposeLink(str){
    var match = str.match(/\/v(1|2).*/);
    str = match? match[0]: str;
    var idx = str.indexOf('?');
    if(idx !=-1){
        return {
            leftPart: str.substring(0, idx),
            rightPart: str.substring(idx+1)
        }
    }
    return {
        leftPart: str,
        rightPart:''
    }
}
//will ignore the begining of the link PROVIDED that it includes a /v1/.
//if it doesn't, well... I'll check that everything matches, including domain...
/**
 * [compareLink description]
 * @param  {{users:'http://whatever?page=1', self:'osef?page=1&offset=2'}} linkRef  
 * @param  {[type]} linkTest [description]
 * will return true if test matches ref (objectId and mandatory query params)
 * if :any is present, it will match everything (not containing a slash)
 * @return {[type]}          [description]
 */
function compareLink(linkRef, linkTest){
    var ref = decomposeLink(linkRef);
    var test = decomposeLink(linkTest);
    var leftRef = ref.leftPart.split('/');
    var leftTest = test.leftPart.split('/');
    if(leftRef.length != leftTest.length){
        return false;
    }
    var ok = leftRef.every(function(part, i){
        var test = leftTest[i];
        if(isObjectId(part)){
            return isObjectId(test);
        }
        if(part == ':any'){
            return true;
        }
        return part == test;
    });

    if(!ok){return false;}
    return areParamsOkay(ref.rightPart, test.rightPart); 
}
module.exports = {
    checkKeys: checkKeys,
    checkLinks: checkLinks,
    checkJson: checkJson,
    set:(k,v)=>{
        if(k!='debug'){throw 'only debug key'}
        DEBUG = v;
    }
};