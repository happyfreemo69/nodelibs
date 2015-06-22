var fs = require('fs');
var exports = module.exports;
fs.readdir(__dirname+'/lib', function(err, files){
    if(err)throw err;
    files.filter(function(x){
        return x!='index.js';
    }).forEach(function(x){
        if(x.match(/\.js$/)){
            var exportKey = x.slice(0,-3);
            exports[exportKey] = require('./lib/'+x);
        }
    })
})