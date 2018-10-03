var dic = {}
/**
 * [Ip description]
 * @param {[type]} ip of the form
 * {
 *     upstream:string,
 *     port:number,
 *     host:string,
 *     protocol: string
 * }
 */
function Ip(o){
    this._port = o.port;
    this._host = o.host;
    this._upstream = o.upstream;
    this._prot = o.protocol;
}
Ip.prototype.url = function(){
    return this._prot+'://'+this._host+':'+this._port;
}
Ip.prototype.host = function(){
    return this._host;
}
Ip.prototype.port = function(){
    return this._port;
}
Ip.prototype.upstream = function(){
    return this._upstream;
}
Ip.prototype.protocol = function(){
    return this._prot;
}
/**
 * 
 * @param {[type]} json of the format
 * {
 *     userd:{
 *         upstream:string,
 *         port:number
 *         host:string
 *     }
 * }
 * as a reminder, upstream is to be put in header HOST
 * port is probably 80
 * host is the ip to point to the front
 *
 * note that, there is pub interface anymore.
 */
function Network(json){
    this.json = json;
    Object.keys(json).forEach(k=>{
        this[k] = _=>new Ip(json[k])
    })
}

Network.getProtocolModule = function(str){
    if(str=='http') return require('http')
    if(str=='https') return require('https')
    throw 'invalid protocol ('+str+'). Expect http or  https'
}
module.exports = Network;