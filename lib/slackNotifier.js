var request = require('request');
function notify(str, logger){
    console.log('zstr :' , str)
    var json = {"channel": "#api", "username": "webhookbot", "text": str, "icon_emoji": ":ghost:"};
    request({
        url:'https://hooks.slack.com/services/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',
        method:'POST',
        json: true,
        body: json
     },function (error, response, body){
        if (!error && response.statusCode == 200) {
            logger && logger.inf('papertrails notif sent');
        }else{
            logger && logger.err('papertrails slackNotif failed', error, response.body);
        }
    });
    return false;
}
module.exports = {
    notify:notify
}