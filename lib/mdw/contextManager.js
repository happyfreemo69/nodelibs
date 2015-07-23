/**
 * @param  {[type]} config must implement logger
 */
module.exports = function(config){
    return function(req, res, next) {
        if(process.domain){
            var d = process.domain;
            d.ctx = {};
            d.run(function(){
                next();
            });
        }else{
            config.logger.inf('could not initialize context');
            next();
        }
    };
}