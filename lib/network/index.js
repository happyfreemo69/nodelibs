var dic = {}

dic.my = {
    pub:{
        usr: 'http://127.0.0.1:4000',
        dev: 'https://synty-api-dev.cityzendesk.com',
        uat: 'https://synty-api-uat.cityzendesk.com',
        ppt: 'https://synty-api-ppt.cityzendesk.com',
        prd: 'https://synty-api.cityzendesk.com'
    },
    pri:{
        usr: 'http://127.0.0.1:4000',
        dev: 'http://127.0.0.1:4000',
        uat: 'http://127.0.0.1:4000',
        ppt: 'http://127.0.0.1:4000',
        prd: 'http://127.0.0.1:4000',
    }
};

dic.assetD = {
    pub:{
        usr: 'https://asset-dev.cityzendesk.com',
        dev: 'https://asset-dev.cityzendesk.com',
        uat: 'https://asset-uat.cityzendesk.com',
        ppt: 'https://asset-ppt.cityzendesk.com',
        prd: 'https://asset.cityzendesk.com'
    },
    pri:{
        usr: 'https://asset-dev.cityzendesk.com:443',
        dev: 'https://asset-dev.cityzendesk.com:443',
        uat: 'https://asset-uat.cityzendesk.com:443',
        ppt: 'https://asset-ppt.cityzendesk.com:443',
        prd: 'https://asset.cityzendesk.com:443'
    }
};

dic.userD = {
    pub:{
        usr: 'https://account-api-dev.cityzendesk.com',
        dev: 'https://account-api-dev.cityzendesk.com',
        uat: 'https://account-api-uat.cityzendesk.com',
        ppt: 'https://account-api-ppt.cityzendesk.com',
        prd: 'https://account-api.cityzendesk.com'
    },
    pri:{
        usr: 'https://account-api-dev.cityzendesk.com:443',
        dev: 'https://account-api-dev.cityzendesk.com:443',
        uat: 'https://account-api-uat.cityzendesk.com:443',
        ppt: 'https://account-api-ppt.cityzendesk.com:443',
        prd: 'https://account-api.cityzendesk.com:443'
    }
};

//pub is a wrong keyword, it should be https because geod is not accessible for the outside
dic.geoD = {
    pub:{
        usr: 'https://geod-tst.cityzendesk.com',
        dev: 'https://geod-tst.cityzendesk.com',
        uat: 'https://geod-tst.cityzendesk.com',
        ppt: 'https://geod-prd.cityzendesk.com',
        prd: 'https://geod-prd.cityzendesk.com'
    },
    pri:{
        usr: 'http://geod-tst.cityzendesk.com:80',
        dev: 'http://geod-tst.cityzendesk.com:80',
        uat: 'http://geod-tst.cityzendesk.com:80',
        ppt: 'http://geod-prd.cityzendesk.com:80',
        prd: 'http://geod-prd.cityzendesk.com:80'
    }
};

dic.bo = {
    pub:{
        usr: 'https://synty-bo-usr.cityzendesk.com',
        dev: 'https://synty-bo-dev.cityzendesk.com',
        uat: 'https://synty-bo-uat.cityzendesk.com',
        ppt: 'https://synty-bo-ppt.cityzendesk.com',
        prd: 'https://synty-bo.cityzendesk.com'
    },
    pri:{
        usr: 'https://synty-bo-usr.cityzendesk.com',
        dev: 'https://synty-bo-dev.cityzendesk.com',
        uat: 'https://synty-bo-uat.cityzendesk.com',
        ppt: 'https://synty-bo-ppt.cityzendesk.com',
        prd: 'https://synty-bo.cityzendesk.com'
    }
};

dic.publicPage = {
    pub:{
        usr: 'https://public-dev.cityzendesk.com',
        dev: 'https://public-dev.cityzendesk.com',
        uat: 'https://public-uat.cityzendesk.com',
        ppt: 'https://public-ppt.cityzendesk.com',
        prd: 'https://public.cityzendesk.com'
    },
    pri:{
        usr: 'https://public-dev.cityzendesk.com',
        dev: 'https://public-dev.cityzendesk.com',
        uat: 'https://public-uat.cityzendesk.com',
        ppt: 'https://public-ppt.cityzendesk.com',
        prd: 'https://public.cityzendesk.com'
    }
};

dic.lgs = {
    pub:{
        usr: 'http://lgs-usr.cityzendesk.com',
        dev: 'http://lgs-uat.cityzendesk.com',
        uat: 'http://lgs-uat.cityzendesk.com',
        ppt: 'http://lgs.cityzendesk.com',
        prd: 'http://lgs.cityzendesk.com'
    },
    pri:{
        usr: 'http://lgs-usr.cityzendesk.com:4012',
        dev: 'http://lgs-uat.cityzendesk.com:4012',
        uat: 'http://lgs-uat.cityzendesk.com:4012',
        ppt: 'http://lgs.cityzendesk.com:4012',
        prd: 'http://lgs.cityzendesk.com:4012'
    }
};

//pri should be: r.something (to ensure we know we target a private endpoint located on the fe)
dic.gateway = {
    pub:{
        usr: 'https://gateway-usr.cityzendesk.com',
        dev: 'https://gateway-dev.cityzendesk.com',
        uat: 'https://gateway-uat.cityzendesk.com',
        ppt: 'https://gateway-ppt.cityzendesk.com',
        prd: 'https://gateway.cityzendesk.com'
    },
    pri:{
        usr: 'http://gateway-usr.cityzendesk.com:80',
        dev: 'http://gateway-dev.cityzendesk.com:80',
        uat: 'http://gateway-uat.cityzendesk.com:80',
        ppt: 'http://gateway-ppt.cityzendesk.com:80',
        prd: 'http://gateway.cityzendesk.com:80'
    }
};

dic.admserv = {
    pub:{
        usr: 'https://admserv-usr.cityzendesk.com',
        dev: 'https://admserv-dev.cityzendesk.com',
        uat: 'https://admserv-uat.cityzendesk.com',
        ppt: 'https://admserv-ppt.cityzendesk.com',
        prd: 'https://admserv.cityzendesk.com'
    },
    pri:{
        usr: 'https://admserv-usr.cityzendesk.com',
        dev: 'https://admserv-dev.cityzendesk.com',
        uat: 'https://admserv-uat.cityzendesk.com',
        ppt: 'https://admserv-ppt.cityzendesk.com',
        prd: 'https://admserv.cityzendesk.com'
    }
}

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
Ip.prototype.protocol = function(){
    return this.ip.startsWith('https')?'https':'http';
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
 * Purpose of network is to propose interfaces to external calls of cityzendesk machines
 * Every cityzendesk machines in here should expose a public and/or private dns
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
Network.prototype.synty = function(){
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
Network.prototype.lgs = function(){
    return new IpResolver(this.dic.lgs, this.phase);
}
Network.prototype.publicPage = function(){
    return new IpResolver(this.dic.publicPage, this.phase);
}
Network.prototype.gateway = function(){
    return new IpResolver(this.dic.gateway, this.phase);
}
Network.prototype.admserv = function(){
    return new IpResolver(this.dic.admserv, this.phase);
}
module.exports = Network;