var _ = require('lodash');
var config = require('../../config');
var Logger = config.logger;
var email = require('mailer');
var mustache = require('mustache');
var fs = require('fs');
var issueTemplate = fs.readFileSync(__dirname+'/issue.hbs').toString();
var residentBuildingTemplate = fs.readFileSync(__dirname+'/residentBuilding.hbs').toString();
var residentBlockTemplate = fs.readFileSync(__dirname+'/residentBlock.hbs').toString();
var AddressApi = require('../../externalCalls/addressApi');

/**
 * we are wrapping mailer
 * because we may want to change of mailing system
 * 
 * @param  o obj
 *         expects : 
 *         to
 *         from
 *         subject
 *         body
 * @param  fn callback
 */
function send(o, fn){
    fn = fn || function(){}
    var options = _.merge({}, config.mail, o);
    Logger.dbg('sendMail', config.hot.sendMails)
    if(config.hot.sendMails){
        Logger.dbg(options);//note : pwd is outputted in clear.. think of it when moving log out of this machine
        return email.send(options, fn)
    }
    return fn();
}

function sendIssue(freemo, oauthInfo) {

    // TODO crypt info
    var urlBo = config.hot.syntyBo_url.replace("%s", oauthInfo.access_token+";"+oauthInfo.refresh_token+";"+freemo._id+"&zoneId="+freemo.zoneId._id);
    return freemo.populateQ(['userId', 'zoneId']).then(function(){

        var address = freemo.address;
        try{
            var date = new Date(freemo.createdAt);
            var days = [('0'+date.getDate()).slice(-2), ('0'+(date.getMonth()+1)).slice(-2), date.getFullYear()].join('/');
            var hour = [('0'+date.getHours()).slice(-2), ('0'+date.getMinutes()).slice(-2)].join(':')
            var data = {}
            data.user = freemo.userId;
            data.urlBo = urlBo;
            data.freemo = _.merge(freemo.toJSON(), {createdAt: days, hour:hour});
            data.freemo.hasLocation = freemo.loc.join('')!='00';
            data.freemo.type = data.freemo._type;

            if(data.freemo.type=='issue'){
                data.freemo.type = 'incident';
            }else if(data.freemo.type=='offer'){
                data.freemo.type = 'offre';
            }
            
            data.zone = data.freemo.zoneId;
            data.freemo.latLng = freemo.loc.slice(0).reverse().join(',');
            data.freemoLogo = config.hot.freemoLogo;
            data.oauthInfo = oauthInfo;
            data.access_token = oauthInfo.access_token;
            data.address = address;
        }catch(e){
            config.logger.err('failed to send mail', e);
        }
        var html = mustache.to_html(issueTemplate, data);

        var subject = 'Nouvel incident';
        if(data.freemo.zoneId._type == 'city'){
            subject += ' à '+data.freemo.zoneId.name;
        }else{
            subject += ' au '+address;
        }
        return send({
            to: oauthInfo.to,
            subject: subject,
            html: html
        }, function(e){
            if(e){
                Logger.err(e);   
                return Promise.reject(e);
            }
            return Promise.resolve();
        });

    });
}

function sendFirstInscription(template, user){
    var data = {};
    try{
        var html = mustache.to_html(template, data);
        return send({
            to: user.email,
            subject: 'Inscription Freemo',
            html: html
        }, function(e){
            if(e){
                Logger.err(e);   
                return Promise.reject(e);
            }
            return Promise.resolve();
        });
        
    }catch(e){
        return Promise.reject(e);
    }
}
/**
 * [sendFirstBuildingFreemo description]
 * @param  {[type]} o {o.user, o.freemo}
 * @return {[type]}   [description]
 */
function sendFirstBuildingFreemo(o){
    config.logger.dbg('sendFirstBuildingFreemo: ', o.user);
    return sendFirstInscription(residentBuildingTemplate, o.user);
}

/**
 * [sendFirstBuildingFreemo description]
 * @param  {[type]} o {o.user, o.freemo}
 * @return {[type]}   [description]
 */
function sendFirstBlockFreemo(o){
    config.logger.dbg('sendFirstBuildingFreemo: ', o.user);
    return sendFirstInscription(residentBlockTemplate, o.user);
}

module.exports = {
    send: send,
    sendIssue: sendIssue,
    sendFirstBuildingFreemo: sendFirstBuildingFreemo,
    sendFirstBlockFreemo: sendFirstBlockFreemo,
    email:email
};