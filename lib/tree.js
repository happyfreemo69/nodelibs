var util = require('util');
var _ = require('lodash');
/**
 * elem attributes children and parents properties are discarded
 * children and parents are node instances
 */
function Node(elem, children, parents){
    this.elem = _.omit(elem, ['children', 'parents']);
    this.children = children || [];
    this.parents = parents || [];
};
Node.prototype.down = function(fn){
    fn(this.elem);
    this.children.forEach(function(x){
        x.down(fn);
    });
}
Node.prototype.up = function(fn){
    fn(this.elem);
    this.parents.forEach(function(x){
        x.up(fn);
    });
}
Node.prototype.data = function(){
    return this.elem;
}
Node.prototype.addChild = function(node){
    this.children.push(node);
    node.parents.push(this);
}
Node.prototype.toJSON = function(mapper){
    mapper = mapper||function(x){return x};
    var o = _.merge({}, this.elem);
    o.children = this.children.map(function(x){return x.toJSON(mapper)});
    o = mapper(o);
    return o;
}
/**
 * param elem {id:id} //no children
 * @return {[type]}      [description]
 */
function Tree(map,node){
    Node.call(this, node.elem, node.children, node.parents);
    this.map = map;
    var self = this;
    (function replaceNode(oldNode, newNode){
        self.map[oldNode.data().id] = newNode; //discard the old if exists
        newNode.children.forEach(function(child){
            child.parents.forEach(function(x, i){
                if(x == oldNode){
                    child.parents[i] = newNode;
                }
            });
        })
    })(node, this);
    this.TMP = this;
}
util.inherits(Tree, Node);
Tree.prototype.serialize = function(){
    return JSON.stringify(this.toJSON());
}
Tree.prototype.at = function(i){
    return this.map[i];
}
Tree.prototype.has = function(i){
    return !!this.map[i];
}
Tree.prototype.size = function(){
    return Object.keys(this.map).length;
}
Tree.prototype.addChild = function(parentId, elem){
    var child = allocate(this.map, elem);
    Node.prototype.addChild.call(this.map[parentId], child);
}
Tree.prototype.dispose = function(){
    Object.keys(this.map).forEach(function(id){
        var node = this.map[id];
        node.children = null;
        node.parents = null;
    }, this);
    delete this.map;
}

function allocate(map, elem){
    if(!map.hasOwnProperty(elem.id)){
        map[elem.id] = new Node(elem);
    }
    return map[elem.id];
}

/**
 * given an arr of categ, builds corresponding tree, with nested stuff
 * @param  {[type]} arr categsModel = {
 *   id:fezef, //a string
 *   children:[fezi,fezf] //an array of string
 * }
 * @param root node, is present from categs
 */
Tree.fromArray = function(arr, root){
    var map = {};
    arr.forEach(allocate.bind(null, map));
    arr.forEach(function(elem){
        var node = map[elem.id];
        elem.children.forEach(function(child){
            node.addChild(map[child]);
        })
    });
    var rootNode = map[root.id];
    return new Tree(map, rootNode);
}
/**
 * unserialize what you had before ::serialize()
 */
Tree.unserialize = function(tree){
    tree = JSON.parse(tree);
    var map = {};

    function buildNode(o){
        var n = allocate(map, o);
        var children = o.children.map(buildNode);
        children.forEach(n.addChild.bind(n));
        return n;
    }
    var rootNode = buildNode(tree);
    return new Tree(map, rootNode);
}


module.exports = Tree;
