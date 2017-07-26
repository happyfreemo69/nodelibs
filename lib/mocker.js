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
        done();
        return;
    }
    var ko = (done, e)=>{
        mocker.unmockAll();
        mocker.unpreAll();
        done(e);
        return;
    }
    return function(done){
        if(fn.length <=1){
            try{
                var p = fn.call(this, mocker);
                if(!p || !p.then){
                    return ok(done)
                }
                p.then(()=>{
                    return ok(done)
                }).catch(e=>{
                    return ko(done, e);
                })
                return;
            }catch(e){
                return ko(done, e)
            }
        }
        try{
            fn.call(this, mocker, function(e){
                if(e){throw e}
                return ok(done)
            })
            return;
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