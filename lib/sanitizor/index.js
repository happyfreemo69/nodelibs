var mongoose = require('mongoose');
/**
 * Sanitizor is not made to be complex
 * its purpose is to group conversion of types (be there) complex or not to proper formats
 *
 * An objectId shall be received as string and converted to a mongoose objId
 * A polygon shall be received as an input format and retrieved as a more formatted one
 * etc...
 */

function Sanitizor(){

}

Sanitizor.prototype.int = function(s){
    return parseInt(s, 10);
}

Sanitizor.prototype.float = function(s){
    return parseFloat(s, 10);
}

Sanitizor.prototype.bool = function(s){
    if(s === '1' || s === 'true') return true;
    if(s === '0' || s === 'false') return false;
    return s;
}

Sanitizor.prototype.objId = function(s){
    var mongoose = require('mongoose');
    return mongoose.Types.ObjectId(s);
}

/**
 * str : lng,lat,lng,lat,lng,lat
 * expects:
 *  - points are given in order,
 *  - edges do not cross
 * @return [[lng,lat],[lng,lat],[lng,lat]] last point is the same as first point
 */
Sanitizor.prototype.pol = function(str){

    var values = str.split(',').map(function(x){return parseFloat(x, 10)});
    var points = [];

    for(var i=0; i< values.length; i+=2){
        points.push([values[i], values[i+1]]);
    }
    
    points.push(points[0]);//close cycle
    
    return points;
}

/**
 * modify arr itself
 */
Sanitizor.prototype.mail = function(arr){
    var res =  arr.map(function(x){
        x.categId = x.categoryId;
        delete x.categoryId;
        return x;
    });
    return res;
}

/**
 * [singleOrArray description]
 * @param  {[type]} elem can be an id or an array of id
 * @return {[type]} returns an array of mongoose id
 */
Sanitizor.prototype.singleToArray = function(elem){
    var res = elem;
    if(!(elem instanceof Array)){
        res = [elem];
    }
    return res.map(mongoose.Types.ObjectId);
}



module.exports = new Sanitizor;