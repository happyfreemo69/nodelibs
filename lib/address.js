var util = require('util');
var Promise = require('bluebird');

/**
 * Dummy address parsing
 * TODO: interface via address API instead
 */
function Address(address, zipCode, town){
    this.address = address.trim();
    this.zipCode = zipCode||'';
    this.town = town||'';
}
Address.prototype.toJSON = function(){
    return {
        address:this.address,
        zipCode: this.zipCode,
        town: this.town
    }
}
Address.parse = function(str){
    var res = str.match(/[0-9]{5}(.*)/);
    if(!res){
        return (new Address(str)).toJSON();
    }
    var idx = str.indexOf(res[0]);
    var address = str.substring(0, idx).replace(/[^\w]+$/,'');
    var left = str.substring(idx);

    if(left.length == 5){
        var zipCode = left;
        return (new Address(address, zipCode)).toJSON();
    }

    var split = left.split(/\s/);//postalCode town
    var zipCode = split[0];
    var town = split.slice(1).join(' ').match(/[^,]+/)
    town = town && town[0]||'';
    return (new Address(address, zipCode, town)).toJSON();
}
Address.prototype.toString = function(){
    return [this.address, this.zipCode, this.town].join(' ').trim();
}
module.exports = Address;