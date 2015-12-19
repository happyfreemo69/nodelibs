var assert = require('assert');
var querystring = require('querystring');

function checkKeys(jsonRef, json, done){
    var keysRef = Object.keys(jsonRef).sort(function(a,b){ return a.localeCompare(b)});
    var keysTest = Object.keys(json).sort(function(a,b){ return a.localeCompare(b)});
    assert.equal(keysRef.length, keysTest.length, 'got : \n'+keysTest+'\n'+keysRef);
    keysRef.forEach(function(key, i){
        assert.equal(key, keysTest[i], 'missing '+key+'\n'+(keysTest+'\n'+keysRef));
    });
    return done && done();
}

function checkLinks(linksRef, linksTest, done){
    var keysRef = Object.keys(linksRef).sort(function(a,b){ return a.localeCompare(b)});
    var keysTest = Object.keys(linksTest).sort(function(a,b){ return a.localeCompare(b)});
    assert.equal(keysRef.length,keysTest.length, "links length different");
    checkKeys(linksRef, linksTest);
    Object.keys(linksRef).forEach(function(link){
        assert(linksTest.hasOwnProperty(link), link+" missing in json")
        assert(compareLink(linksRef[link], linksTest[link]), 'link fails : '+link+':'+linksRef[link]+'!='+linksTest[link]);
    });

    return done && done();
}

function checkJson(jsonRef, json, done){
    checkKeys(jsonRef, json);
    checkLinks(jsonRef.links, json.links);
    return done && done();
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
        return refTest.hasOwnProperty(key);
    });
}

/**
 * @param  {[type]} str link of the form http://v1/whatever?someParams...
 * 
 * left part is a string: everything starting with /v1/ and before '?', rightPart, everything after '?'
 * @return {{leftPart, rightPart}}     
 */
function decomposeLink(str){
    var match = str.match(/\/v1.*/);
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
        return part == test;
    });

    if(!ok){return false;}
    return areParamsOkay(ref.rightPart, test.rightPart); 
}
module.exports = {
    checkKeys: checkKeys,
    checkLinks: checkLinks,
    checkJson: checkJson
};