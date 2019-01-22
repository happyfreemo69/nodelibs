/**
 * override Fields method with freemo specifics
 */

var cheerio = require('cheerio');

var V = exports = module.exports = require('./base.js');
var Field = require('./field');
V.Field = Field;


exports.pol = function(){
    return exports.str().func(function(key, val){

        if(!val){
            return true;
        }
        var i=0;
        var res = val.split(',').every(function(x){
            i++;
            var f = parseFloat(x,10)+'';
            if(x.indexOf('.')==-1){
                return f == x;
            }
            var ret = f == x.replace(/0*$/g,'');
            return ret;
        });
        if(res && i%2 == 0){return true}
        return 'expect lon,lat,lon,lat...'
    })
}

exports.mail = function(){
    var o = {
        email:V.str().req(),
        label:V.str()
    };
    var mails = V.arr(V.sub(o))
    return exports.arr(V.sub({
        categoryId:V.objId().req(),
        to:V.arr(V.sub(o), 1),
        cc:V.arr(V.sub(o))
    }));
}

exports.firstOfMonth = function(){
    return V.num().func(function(key, val){
        if(!val) return true;
        var d = new Date(val);
        if(d.getDate()!=1){
            return key+' expects first day of month got ('+d+')';
        }
        var now = new Date;
        var startingNextMonth = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if(startingNextMonth.getTime() > d.getTime()){
            return key+' expects a greater date than current month ('+d+')';
        }
        return true;
    });
}

/**
 * Validate html with given allowed tags
 * @param tags format {tag1 : [attr11, attr12], tag2: [attr21], tag3 : []}
 * @returns {*}
 */
exports.html = function(tags){
    return V.str().func(function(key,val){
        if(!val) return true;
        let allowedTags = Object.keys(tags);
        const nodes = cheerio.parseHTML(val);

        //Step 1 : flat the nodes
        let flatNodes = function(nodes) {
            return nodes.reduce((acc, val) => {
                acc = [].concat(acc);
                //Exclude node if not a tag
                if (val.type === 'tag') {
                    acc = acc.concat(val);
                }
                if(val.children) {
                    acc = acc.concat(flatNodes(val.children))
                }
                return acc;
            }, [])
        };

        let allNodes = flatNodes(nodes);
        let error = 'invalid html';
        let res = !allNodes.find(node => {
            //Step 2 : Handle allowed tags
            if (allowedTags.indexOf(node.name) === -1 ) {
                error = 'tag ('+node.name+') is not allowed';
                return true;
            }
            //Step 3 : Handle allowd attributes by node
            if(node.attribs ) {
                return Object.keys(node.attribs).find(attr => {
                    if(tags[node.name].indexOf(attr) === -1) {
                        error = 'attr ('+attr +') is not allowed for the tag ('+node.name+')';
                        return true;
                    }
                })
            }
            return false;
        });
        return !res ? error : true;
    });
}

exports.validateRequest = function(data, rules, groups, applyOn){
    return new Promise(function(resolve, reject){
        var errors = {};
        var sanitizedData = [];

        Object.keys(rules).forEach(function(key){
            var res = rules[key].validate(key, data[key]);
            if(res !== true){
                errors[key] = V.clean(res);
            }

            //do not add fields which were not supplied in request
            if(data.hasOwnProperty(key)){
                sanitizedData.push({
                    field: key,
                    value: rules[key].sanitize(data[key])
                })
            }
        });
        if(Object.keys(errors).length){
            return reject({
                applyOn:applyOn,
                flat:function(){
                    return errors;
                }
            });
        }
        return resolve(sanitizedData);
    });

}