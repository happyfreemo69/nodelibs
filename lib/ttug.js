function Ttug(len){
    if(!len){throw 'expect len or str'}
    this.len = len
    this.map = {}
}

Ttug.fromString = function(str){
    var lines = str.split('\n').map(x=>x.trim()).filter(x=>x.length).map(x=>x.split(';'))
    var count = lines[0].length;
    if(!lines.every(x=>x.length==count)){
        throw 'not all lines have size \n'+lines.join('\n');
    }
    var Self = this;//in case of subclassing
    var t = new Self(lines[0].length);
    lines.forEach(x=>t.push.apply(t,x))
    return t;
}

Ttug.prototype.push = function(...arr){
    if(!arr.length == this.len){throw 'wrong number of arguments (expects '+this.len+')';}
    var traversed = this.map;
    for(var i = 0; i<this.len-2; ++i){
        var x = arr[i];
        traversed[x] = traversed[x] || {};
        traversed = traversed[x]
    }
    traversed[arr[arr.length-2]] = arr[arr.length-1];
}

/**
 * column ordered fashion
 */
Ttug.prototype.ensureEntry = function(...arr){
    var tryMatch = (obj, str, onOk)=>{
        if(obj[str]){onOk(str); return obj[str]}
        if(obj['*']){onOk('*'); return obj['*']}
        return false;
    }
    var res = this.map;
    var entry = [];
    var last = arr.pop();
    while(arr.length){
        var x = arr.shift();
        res = tryMatch(res, x, s=>entry.push(s));
        if(!res){return Promise.reject('no match for '+entry.join('|')+'|'+x)}
    }
    if(res == last){entry.push(res);}
    else if(res == '*'){entry.push('*');}
    else return Promise.reject('no match for '+entry.join('|')+'|'+last)

    return Promise.resolve(entry);
}

module.exports = Ttug