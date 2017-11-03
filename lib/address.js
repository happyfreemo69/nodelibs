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

/**
 * @param  {} x returned by reverse geocoding
 * ex:
 * {
 "address_components": [
  {
   "long_name": "1",
   "short_name": "1",
   "types": [
    "street_number"
   ]
  },
  {
   "long_name": "Teleweidestraat",
   "short_name": "Teleweidestraat",
   "types": [
    "route"
   ]
  },
  {
   "long_name": "Pepingen",
   "short_name": "Pepingen",
   "types": [
    "locality",
    "political"
   ]
  },
  {
   "long_name": "Vlaams-Brabant",
   "short_name": "VB",
   "types": [
    "administrative_area_level_2",
    "political"
   ]
  },
  {
   "long_name": "Vlaanderen",
   "short_name": "Vlaanderen",
   "types": [
    "administrative_area_level_1",
    "political"
   ]
  },
  {
   "long_name": "Belgium",
   "short_name": "BE",
   "types": [
    "country",
    "political"
   ]
  },
  {
   "long_name": "1670",
   "short_name": "1670",
   "types": [
    "postal_code"
   ]
  }
 ],

 * @return {[type]}   [description]
 */
Address.parseGoogle = function(x){
    var o = {
        street_number:'',
        route:'',
        postal_code:'',
        locality:''
    };
    var all = 0;
    for(var i = 0; i<x.address_components.length && all!=4; ++i){
        var c = x.address_components[i];
        var component = c.types.find(type=>{
            ['street_number', 'route', 'postal_code', 'locality'].some(x=>{
                if(type == x && o[x]===''){
                    o[x] = c.long_name;
                    all++;
                    return true;
                }
            })
        })

    }
    return (new Address((o.street_number+' '+o.route).trim(), o.postal_code, o.locality)).toJSON();
}

Address.prototype.toString = function(){
    return [this.address, this.zipCode, this.town].join(' ').trim();
}
module.exports = Address;