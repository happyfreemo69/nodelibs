var Address = require('../../lib/address');
var assert = require('assert');
describe('address', function(){
    
    it('parses an address without postal code', function(){
        var s = '4 rue de la claire'
        var res = Address.parse(s);
        assert.equal(res.zipCode, '');
        assert.equal(res.town, '');
        assert.equal(res.address, s);
    });

    it('parses an address with postal code only', function(){
        var s = '4 rue de la claire 12345'
        var res = Address.parse(s);
        assert.equal(res.zipCode, 12345);
        assert.equal(res.town, '');
        assert.equal(res.address, '4 rue de la claire');
    });

    it('parses an address with postal code', function(){
        var s = '4 rue de la claire 12345 Villeurbanne'
        var res = Address.parse(s);
        assert.equal(res.zipCode, 12345);
        assert.equal(res.town, 'Villeurbanne');
        assert.equal(res.address, '4 rue de la claire');
    });

    it('parses some google formatted_address', function(){
        var s = '93 Rue Marietton, 69009 Lyon, France'
        var res = Address.parse(s);
        assert.equal(res.zipCode, 69009);
        assert.equal(res.town, 'Lyon');
        assert.equal(res.address, '93 Rue Marietton');
    });

    it('google austria', function(){
        var p = JSON.parse('{"address_components":[{"long_name":"1","short_name":"1","types":["street_number"]},{"long_name":"Teleweidestraat","short_name":"Teleweidestraat","types":["route"]},{"long_name":"Pepingen","short_name":"Pepingen","types":["locality","political"]},{"long_name":"Vlaams-Brabant","short_name":"VB","types":["administrative_area_level_2","political"]},{"long_name":"Vlaanderen","short_name":"Vlaanderen","types":["administrative_area_level_1","political"]},{"long_name":"Belgium","short_name":"BE","types":["country","political"]},{"long_name":"1670","short_name":"1670","types":["postal_code"]}],"formatted_address":"Teleweidestraat 1, 1670 Pepingen, Belgium","geometry":{"bounds":{"northeast":{"lat":50.7475076,"lng":4.1361281},"southwest":{"lat":50.74170849999999,"lng":4.130385}},"location":{"lat":50.7432648,"lng":4.1347127},"location_type":"RANGE_INTERPOLATED","viewport":{"northeast":{"lat":50.7475076,"lng":4.1361281},"southwest":{"lat":50.74170849999999,"lng":4.130385}}},"place_id":"EilUZWxld2VpZGVzdHJhYXQgMSwgMTY3MCBQZXBpbmdlbiwgQmVsZ2nDqw","types":["street_address"]}');
        var res = Address.parseGoogle(p);
        assert.equal(res.address, '1 Teleweidestraat');
        assert.equal(res.zipCode, 1670);
        assert.equal(res.town, 'Pepingen');
    });

    it('google nostreet', function(){
        var p = JSON.parse('{"address_components":[{"long_name":"Arngrímsgata","short_name":"Arngrímsgata","types":["route"]},{"long_name":"Vesturbær","short_name":"Vesturbær","types":["political","sublocality","sublocality_level_1"]},{"long_name":"Reykjavík","short_name":"RVK","types":["locality","political"]},{"long_name":"Iceland","short_name":"IS","types":["country","political"]}],"formatted_address":"Arngrímsgata, Reykjavík, Iceland","geometry":{"bounds":{"northeast":{"lat":64.14194549999999,"lng":-21.9516287},"southwest":{"lat":64.14145440000001,"lng":-21.9537038}},"location":{"lat":64.1417,"lng":-21.9526662},"location_type":"GEOMETRIC_CENTER","viewport":{"northeast":{"lat":64.14304893029151,"lng":-21.9513172697085},"southwest":{"lat":64.1403509697085,"lng":-21.9540152302915}}},"place_id":"ChIJwTb9aDAL1kgRgG-HVxMokq4","types":["route"]}')
        var res = Address.parseGoogle(p);
        assert.equal(res.address, 'Arngrímsgata');
        assert.equal(res.zipCode, '');
        assert.equal(res.town, 'Reykjavík');
    })
});
