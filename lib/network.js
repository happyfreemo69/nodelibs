var dic = {}

dic.my = {
    pub:{
        usr: 'http://127.0.0.1:4000',
        dev: 'https://synty-api-dev.citylity.com',
        uat: 'https://synty-api-uat.citylity.com',
        prd: 'https://synty-api.citylity.com'
    },
    pri:{
        usr: 'http://127.0.0.1:4000',
        dev: 'http://127.0.0.1:4000',
        uat: 'http://127.0.0.1:4000',
        prd: 'http://127.0.0.1:4000',
    }
};

dic.assetD = {
    pub:{
        usr: 'https://asset-dev.citylity.com',
        dev: 'https://asset-dev.citylity.com',
        uat: 'https://asset-uat.citylity.com',
        prd: 'https://asset.citylity.com'
    },
    pri:{
        usr: 'https://asset-dev.citylity.com:443',
        dev: 'https://asset-dev.citylity.com:443',
        uat: 'https://asset-uat.citylity.com:443',
        prd: 'https://asset.citylity.com:443'
    }
};

dic.userD = {
    pub:{
        usr: 'https://account-api-dev.citylity.com',
        dev: 'https://account-api-dev.citylity.com',
        uat: 'https://account-api-uat.citylity.com',
        prd: 'https://account-api.citylity.com'
    },
    pri:{
        usr: 'https://account-api-dev.citylity.com:443',
        dev: 'https://account-api-dev.citylity.com:443',
        uat: 'https://account-api-uat.citylity.com:443',
        prd: 'https://account-api.citylity.com:443'
    }
};

//pub is a wrong keyword, it should be https because geod is not accessible for the outside
dic.geoD = {
    pub:{
        usr: 'https://geod-tst.citylity.com',//todo move out those ports to nginx
        dev: 'https://geod-tst.citylity.com',//uses spdy so bypasses not
        uat: 'https://geod-tst.citylity.com',//feel free to hate me
        prd: 'https://geod-prd.citylity.com'
    },
    pri:{
        usr: 'https://geod-tst.citylity.com:443',//todo move out those ports to nginx
        dev: 'https://geod-tst.citylity.com:443',
        uat: 'https://geod-tst.citylity.com:443',
        prd: 'https://geod-prd.citylity.com:443'
    }
};

dic.bo = {
    pub:{
        usr: 'https://synty-bo-usr.citylity.com',//todo move out those ports to nginx
        dev: 'https://synty-bo-dev.citylity.com',//uses spdy so bypasses not
        uat: 'https://synty-bo-uat.citylity.com',//feel free to hate me
        prd: 'https://synty-bo.citylity.com'
    },
    pri:{
        usr: 'https://synty-bo-usr.citylity.com',//todo move out those ports to nginx
        dev: 'https://synty-bo-dev.citylity.com',//uses spdy so bypasses not
        uat: 'https://synty-bo-uat.citylity.com',//feel free to hate me
        prd: 'https://synty-bo.citylity.com'
    }
};
/**
 * Purpose of ipResolver is to give the correct ip corresponding to a phase
 * Ip can be public or private
 * By default, gives the public ip
 * 
 * @param { {
 *        pub:{usr:'',...},
 *        pri:{usr:'',...} iDic
 * }} phase exception thrown if phase not matching enum
 */
function IpResolver(iDic, phase){
    this.phase = phase;
    this.priDic = iDic.pri;
    this.pubDic = iDic.pub;
}
function Ip(ip){
    this.ip = ip;
}
Ip.prototype.url = function(){
    return this.ip;
}
Ip.prototype.host = function(){
    return this.ip.split(/:(:?\d+)/)[0].replace(/https?:\/\//,'');
}
Ip.prototype.port = function(){
    return this.ip.split(/:(:?\d+)/)[1];
}
IpResolver.prototype.pub = function(){
    return new Ip(this.pubDic[this.phase]);
}
IpResolver.prototype.pri = function(){
    return new Ip(this.priDic[this.phase]);
}
IpResolver.prototype.priToPub = function(str){
    return str.replace(this.priDic[this.phase], this.pubDic[this.phase]);
}

/**
 * Purpose of network is to propose interfaces to external calls of citylity machines
 * Every citylity machines in here should expose a public and/or private dns
 *
 * It is left to you whether targetting machines with public ip or private ip
 * For convenience purpose you can map a private ip to a public ip (see privateToPublic)
 * 
 * @param {usr|dev|uat|ppt|prd} phase exception thrown if phase not matching enum
 */
function Network(phase, iDic){
    if(['usr', 'dev', 'uat', 'ppt', 'prd'].indexOf(phase) == -1){
        throw 'invalid phase ', phase;
    }
    this.phase = phase;
    this.dic = iDic || dic;
}
Network.prototype.my = function(){
    return new IpResolver(this.dic.my, this.phase);
}
Network.prototype.assetD = function(){
    return new IpResolver(this.dic.assetD, this.phase);
}
Network.prototype.userD = function(){
    return new IpResolver(this.dic.userD, this.phase);
}
Network.prototype.geoD = function(){
    return new IpResolver(this.dic.geoD, this.phase);
}
module.exports = Network;