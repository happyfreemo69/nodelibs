/**
 * Put argv or whatever npm module if we need more arguments
 * @param config
 */
module.exports = function(config){
    var optimist = require('optimist')
    .usage('$0: node app --noauth')
    .options('a', {
        alias : 'auth',
        default : true,
        type:'boolean'
    })
    .options('h', {
        alias : 'help'
    })

    var argv = optimist.argv;;
    
    var isMocha = argv['$0'].indexOf('mocha') != -1;
    if(argv.help){
        optimist.showHelp()
        process.exit(0);
    }

    if(argv.morgan == 'false' || isMocha && argv.morgan != true){
        config.hot.reqToStdout = false;
    }

    if(argv.auth === false){
        config.securityMode = 'noauth';
    }
    return argv;
};
