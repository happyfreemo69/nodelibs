/**
 * Store fields to be validated
 * if a field is validated it is then sanitized
 */
function ParamChecker(){
  this.body = {};
  this.query = {};
  this.params = {};
  this.current = this.body;
}
ParamChecker.prototype.bodyMode = function(){
  return this.setMode('body');
}
ParamChecker.prototype.queryMode = function(){
  return this.setMode('query');
}
ParamChecker.prototype.paramsMode = function(){
  return this.setMode('params');
}
ParamChecker.prototype.val = function(key, field, sanitizer){
  sanitizer = sanitizer || function(x){return x;}
  this.current[key] = field;
  this.current[key].sanitize = sanitizer;
  return this;
}
ParamChecker.prototype.merge = function(rules){
  Object.keys(rules).forEach(function(key){
    this.current[key] = rules[key]
  }, this);
  return this;
}
ParamChecker.prototype.setMode = function(str){
  this.current = this[str];
  return this;
}
ParamChecker.prototype.fromRf = function(rfRules){
  rfRules.forEach(function(x){
    this.setMode(x.on).merge(x.rules);
  }, this);
  return this.bodyMode();
}
ParamChecker.prototype.toRf = function(){
  return [
    {rules:this.body, on:'body'},
    {rules:this.query, on:'query'},
    {rules:this.params, on:'params'}
  ]
}
ParamChecker.inst = function(){return new ParamChecker}
module.exports = ParamChecker