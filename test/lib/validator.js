var V = require('../../lib/validator');
var assert = require('assert');
function OK(done){return function(){done()}}
describe('validator', function(){

    describe('str', function(){
        it('does min ok', function(done){
            var schema = {
                test : V.str(2)
            };
            V.validate(schema, {test: 'te'}).then(function(err){
                done();
            })
        });
        it('does min ko', function(done){
            var schema = {
                test : V.str(3)
            };
            V.validate(schema, {test: 'te'}).catch(function(err){
                done();
            })
        });
        it('does max ok', function(done){
            var schema = {
                test : V.str(2, 8)
            };
            V.validate(schema, {test: 'tes'}).then(function(err){
                done();
            })
        });
        it('does max ko', function(done){
            var schema = {
                test : V.str(2, 8)
            };
            V.validate(schema, {test: 'testazert'}).catch(function(err){
                done();
            })
        })
        it('validates anyNws', function(done){
            var schema = {
                test : V.str().anyNws()
            };

            V.validate(schema, {test: '  t'}).then(done.bind(null,null));
        })
        it('validates anyNws in middle', function(done){
            var schema = {
                test : V.str().anyNws()
            };
            V.validate(schema, {test: ' t  '}).then(done.bind(null,null));
        })
        it('invalidates anyNws', function(done){
            var schema = {
                test : V.str().anyNws()
            };
            V.validate(schema, {test: '   '}).catch(done.bind(null,null));
        })
    });
    describe('require', function(){
        it('not req field missing', function(done){
            var schema = {
                test : V.str(2, 8)
            };
            V.validate(schema, {test2: 'testazert'}).then(function(err){
                done();
            })
        });
        it('req field missing', function(done){
            var schema = {
                test : V.str(2, 8).req()
            };
            V.validate(schema, {test2: 'testazert'}).catch(function(err){
                done();
            })
        });
        it('req field there', function(done){
            var schema = {
                test : V.str(2, 8).req()
            };
            V.validate(schema, {test: 'oks'}).then(function(err){
                done();
            })
        })
    });
    describe('num', function(){
        it('does min ok', function(done){
            var schema = {
                test : V.num(1)
            };
            V.validate(schema, {test: 3}).then(function(err){
                done();
            })
        });
        it('does min ko', function(done){
            var schema = {
                test : V.num(1)
            };
            V.validate(schema, {test: 0}).catch(function(err){
                done();
            })
        });
        it('accepts negative value', function(done){
            var schema = {
                test : V.num(-1)
            };
            V.validate(schema, {test: 0}).then(done.bind(null, null))
        });
    });
    describe('func', function(){

        it('funcs ok', function(done){
            var schema = {
                test : V.func(function(key, val, ctx){
                    return true
                })
            };
            V.validate(schema, {test: 3}).then(function(err){
                done();
            })
        });
        it('funcs fail', function(done){
            var schema = {
                test : V.func(function(){
                    return 'this fails';
                })
            };
            V.validate(schema, {test: 0}).catch(function(err){
                done();
            })
        });
    });
    describe('multiple fields', function(){
        it('both required and present', function(done){
            var schema = {
                one:V.num(1).req(),
                two:V.str(2).req()
            };
            V.validate(schema, {one:2, two:'two'}).then(function(){
                done();
            })
        });
        it('both required one missing', function(done){
            var schema = {
                one:V.num(1).req(),
                two:V.str(2).req()
            };
            V.validate(schema, {one:2}).catch(function(){
                done();
            })
        })
    });
    describe('sub', function(){
        it('recognize subfield', function(done){
            var schema = {
                dum:V.sub({
                    param:V.num(1).req()
                })
            };
            V.validate(schema, {dum:{param:3}}).then(function(){
                done();
            })
        });
        it('fails sub req but field missing', function(done){
            var schema = {
                dum:V.sub({
                    param:V.num(1).req()
                })
            };
            V.validate(schema, {dum:2}).catch(function(){
                done();
            })
        });
        it('still ignores if no sub provided', function(done){
            var schema = {
                dum:V.sub({
                    param:V.num(1).req()
                })
            };
            V.validate(schema, {}).then(function(){
                done();
            })
        });
        it('but fails if required', function(done){
            var schema = {
                dum:V.sub({
                    param:V.num(1).req()
                }).req()
            };
            V.validate(schema, {}).catch(function(){
                done();
            })
        })
    });


    describe('bool', function(){
        it('does bool ok', function(done){
            var schema = {
                test : V.bool()
            };
            V.validate(schema, {test: false}).then(function(err){
                done();
            })
        });
        it('does bool ko', function(done){
            var schema = {
                test : V.bool(3)
            };
            V.validate(schema, {test: 'te'}).catch(function(err){
                done();
            })
        });
    })


    describe('enum', function(){
        it('does enum ok', function(done){
            var schema = {
                test : V.enum('one','two')
            };
            V.validate(schema, {test: 'one'}).then(function(err){
                done();
            })
        });
        it('does enum ko', function(done){
            var schema = {
                test : V.enum('one')
            };
            V.validate(schema, {test: 'te'}).catch(function(err){
                done();
            })
        });
        it('does enum not mandatory', function(done){
            var schema = {
                test : V.enum('one')
            };
            V.validate(schema, {design: 'te'}).then(function(err){
                done();
            })
        });
    })

    describe('multi', function(){
        it('two wrong', function(done){
            var schema = {
                test : V.enum('one','two'),
                test2 : V.bool()
            };
            V.validate(schema, {test: 'coco', test2: 'coco'}).catch(function(err){
                done();
            })
        });
    })


    describe('arr', function(){

        it('ok no arr', function(done){
            var schema = {
                test : V.arr(),
            };
            V.validate(schema, {test2: '12,13,1.1,1.2'}).then(done.bind(null,null))
        });
        it('ok arr with no conditions', function(done){
            var schema = {
                test : V.arr(),
            };
            V.validate(schema, {test: [1,2,3]}).then(done.bind(null,null));
        });
        it('ok arr with a objId expected', function(done){
            var schema = {
                test : V.arr(V.objId()),
            };
            V.validate(schema, {test: ['000000000000000000000000']}).then(done.bind(null,null))
        });
        it('ok arr with min and max length', function(done){
            var schema = {
                test : V.arr(null, 1,2),
            };
            V.validate(schema, {test: [1,2]}).then(done.bind(null,null))
        });
        it('nok arr too big', function(done){
            var schema = {
                test : V.arr(null, 1,2),
            };
            V.validate(schema, {test: [1,2,3]}).catch(done.bind(null,null))
        });
        it('ok arr with 0 length', function(done){
            var schema = {
                test : V.arr(),
            };
            V.validate(schema, {test: []}).then(done.bind(null,null))
        });
        it('nok not arr given', function(done){
            var schema = {
                test : V.arr(),
            };
            V.validate(schema, {test: 'test'}).catch(done.bind(null,null))
        });
    })
});
