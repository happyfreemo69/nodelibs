var exports = module.exports;
var Promise = require('bluebird');

/**
 * This will add two functions to proto
 * funcName is the name of the first added function
 * funcNameCount is the namae of the second one
 *
 * func is a function which must return a query.
 * postFuncQuery is facultative and will be in charge of returning a Promise when called, if provided
 *
 *
 * @param proto
 * @param funcName
 * @param func
 * @param @deprecated postFuncQuery. You dont want to use a wrapper of your query
 *   because it means you have not built your query, and it itself will not be paginable
 *   TODO: remove this postFuncQuery. Bad design.
 */
exports.paginatify = function(proto, funcName, func, postFuncQuery){
    var res = exports.paginate(func, postFuncQuery);

    proto[funcName] = res.dataFunc;
    proto[funcName+'Count'] = res.countFunc;
};

/**
    func: a function which returns a query
    OR a query itsef
    
    postFuncQuery to be run after query is built
    NOTE: if you are paginating by timestamp postFuncquery will fail
    returns: 
        dataFunc, a promise, 
        countFunc, a promise which executes the query and gives count
*/
exports.paginate = function(func, postFuncQuery, options){
    var f = typeof(func)=='function'? func : function(where){
        //if this is a query, dupplicate it because count/data
        var childQuery = func.toConstructor();
        return childQuery();
    };
    postFuncQuery = postFuncQuery || function(query){
        return query.execQ().then(function(result){
            return Promise.resolve(result)
        });
    };

    var res = {}

    //normal
    res.dataFunc = function(where, pagination, opts){
        if(opts){
            options = opts;
        }
        where = where || {};

        //allow no pagination
        pagination = pagination || {};
        //mongoose.set('debug', true)
        var query = f.call(this,where)

        if(pagination.limit){
            query.limit(pagination.limit);
        }

        var schema = query.model;
        //if model allows to paginate from date
        if(options && options.paginationType != 'timestamp' || schema.paginationType != 'timestamp'){
            if(options && options.sort){
                query.sort(options.sort);
            }
            if(pagination.hasOwnProperty('offset')){
                query.skip(pagination.offset)
            }

            return postFuncQuery(query);
        }
        var queryBuilder = schema.initQuery();
        var queries = schema.queries.statics;
        /*
            look for more details into rf ...
            here if we get a since==0, lets assume it means last
             -> gives the last n results
            if we get a until, lets assume it means first
             -> gives the first n results

            last and first are then consistent
            when next gives a collection with length lt limit, then we reached end of the results
            when prev gives a collection with length lt limit, same as above

            when before is there, return from before
            when since is there, return the collection starting from since (exluded) with collection
               SORTED
         */
        var needToReverse = false;
        var sort = function(val){
            if(val == 1){
                needToReverse = true;
            }
            queryBuilder.query.sort({createdAt: val});
        }
        sort(-1);
        var actions = {
            last:function(){
                if(pagination.hasOwnProperty('since') && pagination.since === '0'){
                    queryBuilder.filter(queries.withStartDate, {startDate: 0});
                    sort(1);
                    return true;
                }
            },
            first:function(){
                if(pagination.hasOwnProperty('until') && pagination.until != null){
                    queryBuilder.filter(queries.withEndDate, {endDate: (new Date).getTime()});
                    //hack so rf always let a first link, but prev link appear.
                    //Do we want to always have a first link?
                    //pagination.before = (new Date).getTime();
                    return true;
                }
            },
            next:function(){
                if(pagination.hasOwnProperty('before') && pagination.before != null){
                    queryBuilder.filter(queries.withEndDate, {endDate: pagination.before});
                    return true;
                }
            },
            prev:function(){
                if(pagination.hasOwnProperty('since') && pagination.since != null){
                    queryBuilder.filter(queries.withStartDate, {startDate: pagination.since});
                    sort(1);
                    return true;
                }
            }
        };

        ['last','first','next','prev'].some(function(action){
            var res = actions[action]();
            return res;
        });
        queryBuilder.merge(query);
        query = queryBuilder.query;

        return query.execQ().then(function(res){
            if(needToReverse){
                return res.reverse();
            }
            return res;
        });
        
    };

    //count
    res.countFunc = function(where){
        return f.call(this,where)
            .count()
            .execQ();
    }
    return res;
};

exports.paginateQueries = function(schema, queries){
    Object.keys(queries.statics).forEach(function(key){
        exports.paginatify(schema.statics, key, queries.statics[key]);
    });
    Object.keys(queries.methods).forEach(function(key){
        exports.paginatify(schema.methods, key, queries.methods[key]);
    });
}

/**
 * Only supports timestamp for now, return the corresponding slice of coll
 * @param  {[type]} where      [description], handled but HEAVILY inefficient
 * @param  {[type]} pagination [description], expects same behaviour as classic pagination (since..etc)
 * @param Array arr every elements implement createdAt
 */
exports.paginateSubCollection = function(where, pagination, arr){
    //allow no pagination
    pagination = pagination || {};
    var limit = pagination.limit || 10;
    var needToReverse = false;

    var actions = {
        last:function(){
            if(pagination.hasOwnProperty('since') && pagination.since === '0'){
                needToReverse = true;
                return getOrientedColl(0, true, arr);
            }
            return false;
        },
        first:function(){
            if(pagination.hasOwnProperty('until') && pagination.until != null){
                return getOrientedColl((new Date).getTime(), false, arr);
            }
            return false;
        },
        next:function(){
            if(pagination.hasOwnProperty('before') && pagination.before != null){
                return getOrientedColl(pagination.before, false, arr);
            }
            return false;
        },
        prev:function(){
            if(pagination.hasOwnProperty('since') && pagination.since != null){
                needToReverse = true;
                return getOrientedColl(pagination.since, true, arr);
            }
            return false;
        }
    };
    var result;
    ['last','first','next','prev'].some(function(action){
        var res = actions[action]();
        if(res){
            result = res;
        }
        return res;
    });
    if(!result){
        result = getOrientedColl((new Date).getTime(), false, arr);
    }
    if(needToReverse){
        return result.slice(0, limit).reverse();
    }
    return result.reverse().slice(0, limit);

    /**
     * return sliced collection from anchor excluded to 
     * @param  {[type]} anchor            [description]
     * @param  {[type]} lookIntoTheFuture [description]
     * @param  {[type]} coll              [description]
     * @return {[type]}                   [description]
     */
    function getOrientedColl(anchor, lookIntoTheFuture, coll){
        function findAnchor(arr, pred){//Todo: get a brain and do a dichotomy
            for(var i = 0; i < arr.length; ++i){
                var val = arr[i];
                var order = pred(val);
                if(order == -1 ){
                    return i;
                }
                if(order==0){
                    if(lookIntoTheFuture){
                        return i+1;
                    }
                    return i;
                }
            }
            return arr.length? arr.length:0;
        }

        function order(post){
            if(post.createdAt < anchor){
                return 1;
            }
            if(post.createdAt > anchor){
                return -1;
            }
            return 0;
        }
        var anchorIndex = findAnchor(coll, order);
        if(lookIntoTheFuture){
            return coll.slice(anchorIndex);
        }
        return coll.slice(0, anchorIndex);//anchorIndex excluded
    }


}