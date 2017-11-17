module.exports.mergeIn = function(my){
    var o = process.domain && process.domain.ctx || {};
    my.ts = my.ts || Date.now();
    ['x-forwarded-for', 'pfx', 'sid', 'tid', 'uid'].forEach(x=>{
        if(o[x]){
            my[x] = my[x] || o[x]
        }
    })
    return my;
}
