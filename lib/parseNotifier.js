/**
 * ParseNotifier will send Push from Parse.com
 */
var Parse = require('parse').Parse;
var Promise = require('bluebird');

function ParseNotifier(config){
  this.config = config
  Parse.initialize(this.config.parse.application_id, this.config.parse.javascript_key);
}

ParseNotifier.prototype.sendNewAnswer = function(fromUser, toUsers, freemo){
  var self = this;

  if(!self.config.hot.sendPush) {
    return Promise.resolve();
  };

  var promises = [];
  toUsers.forEach(function(user){

    var queryById = new Parse.Query(Parse.Installation);
    queryById.equalTo('userId', user._id.toString());

    var queryByLogin = new Parse.Query(Parse.Installation);
    queryByLogin.equalTo('user', user.username);

    var p = new Promise(function(resolve, reject){
      try {

        Parse.Push.send({
        where: Parse.Query.or(queryById, queryByLogin),
        data: {
          alert: fromUser.getFullName() + ' a répondu sur le freemo "' + freemo.title+'"'
        }
      }, {
        success: function() {
          // Push was successful
          resolve();
        },
        error: function(error) {
          self.config.logger.err(error)
          resolve(); // always say "yes"
        }
      });

      } catch(e){
        self.config.logger.err(e)
        resolve();
      }
    })

    promises.push(p);
  })

  return Promise.all(promises);
}

ParseNotifier.inst = function(config){return new ParseNotifier(config)}
module.exports = ParseNotifier
