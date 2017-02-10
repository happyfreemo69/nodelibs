function Mocker(){
    this.mocks = new Map;
    this.afts = [];
}
Mocker.prototype.mock = function(obj, pptyName, alt){
    if(!this.mocks.has(obj)){
        this.mocks.set(obj,{})
    }
    var v = this.mocks.get(obj);
    v[pptyName] = obj[pptyName];
    this.mocks.set(obj, v);
    obj[pptyName] = alt;
}
Mocker.prototype.unmockAll = function(){
    for(var [obj, ppties] of this.mocks){
        Object.keys(ppties).forEach(ppty=>{
            obj[ppty] = ppties[ppty]
        })
    }
}
Mocker.mockIt = function(fn){
    var mocker = new Mocker;
    var ok = (done)=>{
        mocker.unmockAll();
        mocker.unpreAll();
        return done();
    }
    var ko = (done, e)=>{
        mocker.unmockAll();
        mocker.unpreAll();
        return done(e);
    }
    return function(done){
        if(fn.length <=1){
            try{
                var p = fn(mocker);
                if(!p || !p.then){
                    return ok(done)
                }
                return p.then(()=>{
                    return ok(done)
                }).catch(e=>{
                    return ko(done, e);
                })
            }catch(e){
                return ko(done, e)
            }
        }
        try{
            return fn(mocker, function(e){
                if(e){throw e}
                return ok(done)
            })
        }catch(e){
            return ko(done, e)
        }
    }
}
Mocker.prototype.pre = function(cbk){
    cbk();
    return this;
}
Mocker.prototype.aft = function(cbk){
    this.afts.push(cbk);
    return this;
}
Mocker.prototype.unpreAll = function(){
    this.afts.forEach(x=>x());
}
module.exports = Mocker;