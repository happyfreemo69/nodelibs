/**
 * Sanitizor is not made to be complex
 * its purpose is to group conversion of types (be there) complex or not to proper formats
 *
 * An objectId shall be received as string and converted to a mongoose objId
 * A polygon shall be received as an input format and retrieved as a more formatted one
 * etc...
 *
 * @param {[(str|objId)]} idCaster function which takes a 24char string and returns an id
 */
function Sanitizor(idCaster){
    if (!(this instanceof Sanitizor)){
        return new Sanitizor(idCaster);
    }
    this.idCaster = idCaster;
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
    return this.idCaster(s);
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
 * replaces value desc by -1, value asc by 1
 * @param  {['key,value','key2,value2'] or 'key,value'} obj [description]
 * @param  {function} replace called on every key. if not given, function is identity
 * @return {[type]}         [description]
 */
Sanitizor.prototype.sort = function(obj, replace){
    var replaceIt = replace||function(){};
    var sortOptions = [].concat(obj).reduce(function(obj, x){
        x = x.split(',');
        var sortField = x.shift();
        sortField = replace(sortField);
        var sortValue = x.shift();
        obj[sortField] = sortValue == 'desc'?-1:1;
        return obj;
    }, {});
    return sortOptions;
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
 * @param boolean active default to true. If true convert elem to objectId. (stupid but keep it to be backward compatible)
 * @return {[type]} returns an array of mongoose id
 */
Sanitizor.prototype.singleToArray = function(elem, active){
    var res = elem;
    if(!(elem instanceof Array)){
        res = [elem];
    }
    if(active == true || typeof(active)=='undefined'){
        return res.map(this.idCaster);
    }
    return res;
}

module.exports = Sanitizor;