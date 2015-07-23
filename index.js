var fs = require('fs');
var exports = module.exports;

/**
 * if fname resolves an instance store it in exports[key]
 * if fname resolves as a constructor, store it in exports[Key]
 * @param  {string} key   name of module to be exported
 * @param  {string} fname filename to require
 */
function loadModule(key, fname){
    var module = require('./lib/'+fname);
    if(module instanceof Function){
        key = key[0].toUpperCase()+key.substring(1);
    }
    exports[key] = module;
}

function handleFiles(err, files){
    if(err)throw err;
    var files = [
        'mdw/contextManager.js',
        'mdw/reqLogger.js',
        'validator',
        'sanitizor',
        'logger',
        'tree.js',
        'urlReplacer.js',
        'modelPaginator.js',
        'paramChecker.js',
        'parseNotifier.js',
        'queryMerger.js',
        'destroyer.js',
        'errorHandler.js',
        'inheriter.js',
        'input.js',
        'agent.js',
        'bulker.js',
        'context.js'
    ]
    files.forEach(function(x){
        if(x.match(/\.js$/)){
            var exportKey = x.slice(0,-3);
            return loadModule(exportKey, x);
        }
        var stats = fs.statSync('./lib/'+x);
        if(stats.isDirectory()){
            return loadModule(x, x);
        }
    })
}








var files = fs.readdirSync(__dirname+'/lib');
handleFiles(null, files);
