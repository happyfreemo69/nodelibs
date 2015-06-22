var http = require('http');
var querystring = require('querystring');
var url = require('url');
var _config;
var _stream;

/**
 * purpose of agent is to modify variable which are allowed to be configurable
 * we want to do something like
 *
 * cap production setVar logLvl 2
 * and we would enable massive logging
 *
 * same holds for
 * cap production setVar sendMails false
 * if we happen to fail with sending mail (or spamming or whatever)
 *
 * cap will call a script on the server which targets us
 */
var _actions = {
  '/set':{
    describe: 'set variable. expects : /set?key=&value=',
    action: setVariable
  },
  '/list':{
    describe: 'list all variables value',
    action: listVariables
  }
};

function getHelpString(){
  return Object.keys(_actions).map(function(key){
    return [key].concat([_actions[key].describe]).join('|');
  }).join('\n');
}
//you dont want a dependency to express...
//keep it light
function setVariable(req, fn){
  return processPost(req, function(err){
    if(err) return fn(err);

    var key = req.post.key;
    var val = req.post.value;
    if(typeof(val)==='undefined' || typeof(val)==='object'){return fn('invalidType '+val)}

    var history = [];
    history.push('>>>>>>>>>>>>>>');
    history.push(key+':'+_config[key]);
    _config[key] = val;
    history.push('<<<<<<<<<<<<<<');
    history.push(key+':'+_config[key]);
    history.forEach(_stream.write.bind(_stream));
    return fn(null, history.join('\n'));
  })
}

function listServices(req, res){
  res.writeHead(200, {'Content-Type': 'text/plain'});
  return res.end(getHelpString());
}

function listVariables(req, fn){
  var list = Object.keys(_config).reduce(function(arr, key){
    var value = _config[key];
    if(typeof(_config[key]) != 'object'){
      arr.push(key+'|'+value);
    }
    return arr;
  }, []);
  fn(null, list.join('\n'));
}

//http://stackoverflow.com/questions/4295782/how-do-you-extract-post-data-in-node-js
function processPost(req, callback) {
    var queryData = "";
    if(req.method == 'POST') {
        req.on('data', function(data) {
            queryData += data;
            if(queryData.length > 400) {
                queryData = '';
                callback('just die');
                req.connection.destroy();
            }
        });
        req.on('end', function() {
          try{
            req.post = querystring.parse(queryData);
            callback(null);
          }catch(e){
            console.log('got err : ',e)
            callback(e);
          }
        });
    } else {
        callback('expects key,val on body');
    }
}



module.exports = {
  /**
   * 
   * @param  {[type]}   config where variables are stored
   * @param  {[type]}   stream must implements write for logging
   * @param  {[type]}   port   port to listen
   * @param  {Function} fn     cbk called when server ready
   */
  start:function(config, stream, port, fn){
    _config = config;
    _stream = stream;
    return http.createServer(function (req, res){
      Object.keys(_actions).some(function(key){
        if(req.url.match(key)){

          _actions[key].action(req, function(err, result){
            res.writeHead(err?500:200, {'Content-Type': 'text/plain'});
            res.end(err && err.toString() || result);
          })

          return true;
        }
        return false;
      }) || listServices(req, res);
    }).listen(port, '127.0.0.1', fn);//NO one exterior to this machine should access it
  }
}