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
function findIt(query, nbElemPerBulk, it, done, onBulkEnd){
    var nextBulk = function(cursor, nbElemPerBulk, it, onBulkEnd){
        var args = arguments;
        var arr = [];
        var docs = true;
        var p = Promise.resolve();
        for(var i = 0; i<nbElemPerBulk; ++i){
            if(!docs){
                break;
            }
            //note: cursor is not made to be used in a parallel fashion.
            //retrieve the items synchronously, but handle the it in parallel
            p = p.then(function(){
                return new Promise(function(resolve, reject){
                    return cursor.nextObject(function(err, val){
                        if(err){
                            docs = false;
                            return reject(err);
                        }
                        if(val == null){
                            docs = false;
                            return resolve();
                        }
                        arr.push(val);
                        return resolve();
                    });
                })
            });
        }
        return p.then(function(){
            var dfds = arr.map(function(val){
                return it(new model(val));
            });
            return Promise.all(dfds).then(function(){
                return onBulkEnd();
            })
        }).then(function(){
            if(!docs){
                return Promise.resolve();
            }
            return nextBulk.apply(null, args);
        })
    }
    done = typeof(done)=='function'?done:Promise.resolve.bind(Promise);
    onBulkEnd = typeof(onBulkEnd)=='function'?onBulkEnd:function(){return Promise.resolve();};
    var model = query.model;
    return model.findOneQ().then(function(){
        //noOp to ensure connection is ok
        //we are using bulkQuery in case of handling a lot of documents.
        //we can allow a noOp but we don't want to use mongoose streams as they are slow
        //as of mongoose 3.8 we don't have a cursor API, so we use the mongo driver hence the noOp
        //additional doc: http://mongoosejs.com/docs/api.html#querycursor-js
        var cursor = model.collection.find(query._conditions, query.options);
        return nextBulk(cursor, nbElemPerBulk, it, onBulkEnd).then(function(){
            return cursor.close();//no need to wait for close
        }).catch(function(e){
            cursor.close();
            return done(e);
        })
    })
}

module.exports = {
    bulkIt: bulkIt,
    findIt: findIt,
};