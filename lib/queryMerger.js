function QueryMerger(query, where, callee){
    this.where = where;
    this.callee = callee;
    this.query = query;
}
/**
    f returns a query
*/
QueryMerger.prototype.filter = function(f, args){
    args = args || this.where;
    f.call(this.callee, args, this.query);
    return this;
}

QueryMerger.prototype.run = function(){
    return this.query.execQ();
}

QueryMerger.prototype.merge = function(query){
    /*
    Beware, shall you use it, your conditions in AND or OR will be overriden !!
    check mquery merge
     */
    this.query.merge(query);
    return this;
}
module.exports = QueryMerger;