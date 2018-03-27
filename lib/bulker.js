var util = require('util');
var Promise = require('bluebird');
var readline = require('readline');
function BulkStat(total){
    this.total = total;
    this.oldSetAt = Date.now();
    this.setAt = this.oldSetAt+1;
    this.oldN = 0;
    this.setN = 0;
}
BulkStat.prototype.set = function(n){
    this.oldN = this.setN;
    this.oldAt = this.setAt;
    this.setN = n;
    this.setAt = Date.now();
}
BulkStat.prototype.toString = function(){
    var avg = (this.setN - this.oldN)/(this.setAt - this.oldAt+1);
    var leftOver = (this.total - this.setN)/avg;
    var endsAt = '';
    if(this.total){
        var d = new Date(this.setAt + leftOver);
        endsAt = ' endsAt('+d.getHours()+'h'+d.getMinutes()+'m)';
    }
    return this.setN+'/'+this.total+' (avg='+Math.round(avg*1000)+'r/s)'+endsAt;
}
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
    var bulkStat = new BulkStat(collection.length);
    bulks.forEach(function(bulk, bulkIndex){
        p = p.then(function(){
            var dfds = bulk.map(function(elem){
                return it(elem);
            });
            return Promise.all(dfds).then(function(){
                count += bulk.length;
                delete bulk;
                bulk = null;
                if(module.exports.debug){
                    readline.cursorTo(process.stdout, 0);
                    bulkStat.set(count);
                    process.stdout.write(bulkStat.toString());
                }

                return Promise.resolve();
            }).then(function(){
                return onBulkEnd();
            }).catch(done);
        });
    });
    return p.then(done.bind(null, null));
}
/**
 * [findIt description]
 * @param  {[type]}   query         [description]
 * @param  {[type]}   nbElemPerBulk [description]
 * @param  {[type]}   it            [description]
 * @param  {Function} done          [description]
 * @param  {[type]}   onBulkEnd     [description]
 * @param  {count:boolean}   opts   opts is facultative, if count==true, will count as well (for the output)
 * @return {[type]}                 [description]
 */
function findIt(query, nbElemPerBulk, it, done, onBulkEnd, opts={}){
    var count = 0;
    var previousTs = Date.now();
    var bulkIndex = 0;
    var bulkStat = new BulkStat();
    var nextBulk = function(cursor, nbElemPerBulk, it, onBulkEnd){
        bulkIndex++;
        var args = arguments;
        var arr = [];
        var docs = true;
        var p = Promise.resolve();
        for(var i = 0; i<nbElemPerBulk; ++i){
            //note: cursor is not made to be used in a parallel fashion.
            //retrieve the items synchronously, but handle the it in parallel
            p = p.then(function(){
                if(!docs){
                    return;
                }
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
                var m = new model(undefined, undefined, true);
                return new Promise((ok, fail)=>{
                    m.init(val, undefined,  function(e){
                        return it(m).then(ok).catch(fail);
                    });
                });
            });
            return Promise.all(dfds).then(function(){
                if(module.exports.debug){
                    count += dfds.length;
                    var now = Date.now();
                    if(now - previousTs > 1000){
                        previousTs = now;
                        readline.cursorTo(process.stdout, 0);
                        bulkStat.set(count);
                        process.stdout.write(bulkStat.toString());
                    }
                }
                return onBulkEnd();
            })
        }).then(function(){
            if(!docs){
                return Promise.resolve();
            }
            return nextBulk.apply(null, args);
        })
    }
    done = typeof(done)=='function'?done:(e)=> e && Promise.reject(e) || Promise.resolve();
    onBulkEnd = typeof(onBulkEnd)=='function'?onBulkEnd:function(){return Promise.resolve();};
    var model = query.model;
    var countProm = Promise.resolve();
    if(opts.count){
        countProm = model.count(query._conditions).then(function(x){
            bulkStat.total = x;
        })
    }
    return countProm.then(_=>{
        return model.findOne().then(function(){
            //noOp to ensure connection is ok
            //we are using bulkQuery in case of handling a lot of documents.
            //we can allow a noOp but we don't want to use mongoose streams as they are slow
            //as of mongoose 3.8 we don't have a cursor API, so we use the mongo driver hence the noOp
            //additional doc: http://mongoosejs.com/docs/api.html#querycursor-js
            var cursor = model.collection.find(query._conditions, query.options);
            return nextBulk(cursor, nbElemPerBulk, it, onBulkEnd).then(function(){
                cursor.close();//no need to wait for close
                return null;
            }).catch(function(e){
                cursor.close();
                done(e);
                return Promise.reject(e);
            })
        })
    })
}

/**
 * Opens the file, read n lines, when at least nbElemPerBulk are read
 * calls it on those nbElemPerBulk lines, then call onBulkEnd
 * wait for onBulkEnd to end, then continue
 *
 * @param  {[type]}   fname         [description]
 * @param  {[type]}   nbElemPerBulk [description]
 * @param  {[type]}   it            [description]
 * @param  {Function} done          [description]
 * @param  {[type]}   onBulkEnd     [description]
 * @return {[type]}                 [description]
 */
function bulkFile(fname, nbElemPerBulk, it, done, onBulkEnd){

    done = typeof(done)=='function'?done:function(){};
    onBulkEnd = typeof(onBulkEnd)=='function'?onBulkEnd:function(){return Promise.resolve();};
    var LineByLineReader = require('line-by-line');
    var lr = new LineByLineReader(fname);
    var exec = require('child_process').exec;
    var nbLines = 1;
    var bulkStat = new BulkStat();
    exec('wc -l '+fname, function(err, stdout, stderr){
        if(err||stderr){return;}//silent error
        nbLines = parseInt(stdout.split(' ')[0],10);
        bulkStat.total = nbLines;
    });

    var count = 0;
    var previousTs = Date.now();
    var lines = [];
    var gotError = false;
    return new Promise(function(resolve, reject){
        lr.on('line', function (line) {
            count++;
            lines.push(line);
            if(lines.length >= nbElemPerBulk){
                lr.pause();
                return Promise.all(lines.map(it)).then(function(){
                    return onBulkEnd().then(function(){
                        lines = [];

                        if(module.exports.debug){
                            var now = Date.now();
                            if(now - previousTs > 1000){
                                previousTs = now;
                                bulkStat.set(count);
                                readline.cursorTo(process.stdout, 0);
                                process.stdout.write(bulkStat.toString());
                            }
                        }

                        lr.resume();
                    })
                }).catch(function(e){
                    lines = [];
                    gotError = true;
                    lr.close();
                    reject(e);
                    done(e);
                });
            }
        });

        lr.on('end', function () {
            if(gotError)return;
            return Promise.all(lines.map(it)).then(function(){
                return onBulkEnd().then(function(){
                    return resolve();
                })
            }).catch(function(e){
                if(gotError)return
                done(e);
                reject(e);
            });
        });
    });
}

module.exports = {
    bulkIt: bulkIt,
    findIt: findIt,
    bulkFile: bulkFile
};