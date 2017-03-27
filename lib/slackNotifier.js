var request = require('request');
function Notifier(webhookUrl, channel='#alerts'){
    this.webhookUrl = webhookUrl;
    this.channel = channel;
    if(!webhookUrl){
        throw 'expect valid webhook of the form https://hooks.slack.com/services/xx/xx/xxx'
    }
}
Notifier.prototype.notify = function(str, logger){
    console.log('zstr :' , str)
    var json = {"channel": this.channel, "username": "nodelibs", "text": str, "icon_emoji": ":ghost:"};
    request({
        url:this.webhookUrl,
        method:'POST',
        json: true,
        body: json
     },function (error, response, body){
        if (!error && response.statusCode == 200) {
            if(logger){
                logger.inf('papertrails notif sent');
            }else{
                console.log('papertrails notif sent')
            }
        }else{
            if(logger){
                logger.err('papertrails slackNotif failed', error, response.body);
            }else{
                console.log('papertrails slackNotif failed', error, response.body);
            }
        }
    });
    return false;
}
module.exports = Notifier