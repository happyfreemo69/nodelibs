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
});
