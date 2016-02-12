var dic = {}

dic.my = {
    pub:{
        usr: 'http://127.0.0.1:4000',
        dev: 'https://synty-api-dev.citylity.com:4010',
        uat: 'https://synty-api-uat.citylity.com:4010',
        ppt: 'https://synty-api-ppt.citylity.com:4010',
        prd: 'https://synty-api.citylity.com:4010'
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
        usr: 'https://synty-api-dev.citylity.com:3007',
        dev: 'https://synty-api-dev.citylity.com:3007',
        uat: 'https://synty-api-uat.citylity.com:3007',
        ppt: 'https://synty-api-ppt.citylity.com:3007',
        prd: 'https://synty-api-d.citylity.com:3007'
    },
    pri:{
        usr: 'http://104.155.44.156:3002',
        dev: 'http://104.155.44.156:3002',
        uat: 'http://130.211.77.27:3002',
        ppt: 'http://104.155.11.218:3002',
        prd: 'http://104.155.13.140:3002'
    }
};

dic.userD = {
    pub:{
        usr: 'https://synty-api-dev.citylity.com:4006',
        dev: 'https://synty-api-dev.citylity.com:4006',
        uat: 'https://synty-api-uat.citylity.com:4006',
        ppt: 'https://synty-api-ppt.citylity.com:4006',
        prd: 'https://synty-api-d.citylity.com:4006'
    },
    pri:{
        usr: 'http://104.155.44.156:4001',
        dev: 'http://104.155.44.156:4001',
        uat: 'http://130.211.77.27:4001',
        ppt: 'http://104.155.11.218:4001',
        prd: 'http://104.155.13.140:4001'
    }
};

dic.geoD = {
    pub:{
        usr: 'not opened',
        dev: '',
        uat: '',
        ppt: '',
        prd: ''
    },
    pri:{
        usr: 'http://10.240.0.5:4002',
        dev: 'http://10.240.0.5:4002',
        uat: 'http://10.240.0.5:4002',
        ppt: 'http://10.240.0.5:4002',
        prd: 'http://10.240.0.4:4002'
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