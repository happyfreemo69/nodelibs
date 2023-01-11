var fs = require('fs');
var exports = module.exports;

/**
 * if fname resolves an instance store it in exports[key]
 * if fname resolves as a constructor, store it in exports[Key]
 * @param  {string} key   name of module to be exported
 * @param  {string} fname filename to require
 */
function loadModule(fname){
    var module = require('./lib/'+fname);
    var key = fname;
    if(module instanceof Function){
        key = key[0].toUpperCase()+key.substring(1);
    }
    exports[key] = module;
}

function handleFiles(err, files){
    if(err)throw err;
    var files = [
        'asyncPromiseHandler',
        'mdw/contextManager',
        'mdw/reqLogger',
        'mdw/error',
        'validator',
        'sanitizor',
        'logger',
        'mocker',
        'tree',
        'bbcodeConverter',
        'urlReplacer',
        'network',
        'network/headers',
        'si',
        'jsonChecker',
        'modelPaginator',
        'paramChecker',
        'queryMerger',
        'destroyer',
        'errorHandler',
        'inheriter',
        'input',
        'agent',
        'bulker',
        'ttug',
        'context',
        'asyncPromiseHandler',
        'slackNotifier',
        'address'
    ]
    files.forEach(loadModule)
}








var files = fs.readdirSync(__dirname+'/lib');
handleFiles(null, files);
