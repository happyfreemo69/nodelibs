var ok = require('./ok');

ok.addOrFunc(function(res){
    return res instanceof CutErrors && res.ok();
});

function CutErrors(err){this.err = err;}
CutErrors.prototype.ok = function(){return ok(this.err)};
CutErrors.prototype.concat = function(arr){
    this.err = this.err.concat(arr);
    return this;
};

function uncut(res){
    if(res instanceof Array){
        return res.map(uncut);
    }
    if(res instanceof CutErrors){
        return uncut(res.err);
    }
    return res;
}

function Cut(f){this.f=f;}

/**
 * Concept of cut is somehow like prolog
 * when you cut, you dont want to backtrack for other possibilities.
 * So we juste continue the path until success, or eventually failure(S)
 * but if we have failures, we wont try other alternative available before the cut
 * @param f
 * @returns {Cut}
 */
function cut(f){
    return new Cut(f);
}
Cut.cutted = 'cutted';

module.exports = {
    cut:cut,
    uncut:uncut,
    Cut:Cut,
    CutErrors:CutErrors
};