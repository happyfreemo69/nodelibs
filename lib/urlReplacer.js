var fs = require('fs');

var exports = module.exports;

var mockTransformer = {

    mockResponse: function(req, res, filePath) {
        var self = this;

        fs.readFile(filePath, 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }

            data = exports.transform(req, JSON.parse(data));
            return res.send(data);
        });
    },

}

exports.setLinks = function(x, preUrl){
    if(x.links){
        var links = x.links;
        Object.keys(links).forEach(function(key){
            var obj = links[key];
            var tok = obj.indexOf('v1');
            if(tok == -1){
                return obj;
            }
            links[key] = preUrl+obj.substring(tok+2);
        })
    }
    return x;
}

//if obj contain a property items,
//attempt to update every item.links
//update every links of obj
exports.fastTransform = function(req, mainObj){
    var preUrl = req.protocol+ '://'+ req.get('host')+ "/v1";
    if(mainObj.items){
        mainObj.items = mainObj.items.map(function(x){
            return exports.setLinks(x, preUrl);
        })
    }
    return exports.setLinks(mainObj, preUrl);
}

exports.transform = function(req, mainObj){
    var pool = [];
    return transformObj(req, mainObj);

    function transformObj(req, obj){
        if(obj == null){
            return obj;
        }
        if(obj instanceof Array){
            return obj.map(transformObj.bind(null, req));
        }
        if(typeof(obj)=='object'){
            var index = pool.indexOf(obj);
            if(index != -1){
                throw 'recursive nested object! ';
            }
            pool.push(obj);
            Object.keys(obj).forEach(function(key){
                obj[key] = transformObj(req, obj[key]);
            })
            return obj;
        }
        if(typeof(obj)=='string'){
            var tok = obj.indexOf('v1');
            if(tok == -1){
                return obj;
            }
            return [req.protocol, '://', req.get('host'), "/v1", obj.substring(tok+2)].join('');
        }

        return obj;
    }
};
exports.mockTransformer = mockTransformer;