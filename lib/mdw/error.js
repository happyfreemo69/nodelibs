function end(config = {}){
    return function(e, req,res, next){
        config.logger && config.logger.inf(e);
        if(e.statusCode || e.code){
            res.status(e.statusCode||e.code).json(e);
            return Promise.resolve();
        }
        res.status(500).send(e.toString());
        return Promise.resolve();
    }
}
module.exports = {
    end:end
}