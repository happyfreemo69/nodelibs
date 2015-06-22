module.exports.get = function(key){
    if(process.domain){
        return process.domain.ctx[key];
    }
};
module.exports.set = function(key, value){
    if(process.domain){
        process.domain.ctx[key] = value;
    }
};

