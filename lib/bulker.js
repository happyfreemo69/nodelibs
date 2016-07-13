var util = require('util');
var Promise = require('bluebird');
function bulkIt(collection, nbElemPerBulk, it, done, onBulkEnd){
    done = typeof(done)=='function'?done:function(){};
    onBulkEnd = typeof(onBulkEnd)=='function'?onBulkEnd:function(){return Promise.resolve();};
    var bulks = (function(elems, count){
        var n = elems.length;
        var nbSlices = Math.floor(n/count);
        var arr = [];
        for(var i = 0; i <nbSlices; ++i){
            arr.push(elems.slice(i*count, (i+1)*count));
        }
        if(nbSlices*count < n){
            arr.push(elems.slice(nbSlices*count));
        }
        return arr;
    })(collection, nbElemPerBulk);

    var p = Promise.resolve();
    var count = 0;
    bulks.forEach(function(bulk, bulkIndex){
        p = p.then(function(){
            var dfds = bulk.map(function(elem){
                return it(elem);
            });
            console.time('bulk'+bulkIndex)
            return Promise.all(dfds).then(function(){
                count += bulk.length;
                delete bulk;
                bulk = null;
                console.timeEnd('bulk'+bulkIndex)
                console.log('inserted ', count, '/', collection.length);
                console.log(util.inspect(process.memoryUsage()));

                return Promise.resolve();
            }).then(function(){
                return onBulkEnd();
            }).catch(done);
        });
    });
    return p.then(done.bind(null, null));
}

module.exports = {
    bulkIt: bulkIt
};