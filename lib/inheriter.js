var _ = require('lodash');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function(BaseModel){
    return {
        statics:function (proto, arr){
            arr.forEach(function(keyFunc){
                proto[keyFunc] = BaseModel.schema.statics[keyFunc];
            });
        },
        
        /**
            This method inherits schema of BaseModel
            - it adds a type property on childSchema
            - the corresponding filter type on statics
            - and the schema defined on ModelSchema.schema

            @param o : childSchema definition
            @param type: type of child
        */
        schema:function(o, type){
            if(typeof(BaseModel.schema.innerSchema) == 'undefined'){
                throw 'schema not found for '+BaseModel.modelName;
            }
            var res = _.clone(BaseModel.schema.innerSchema);
            var schemaDefinition = _.assign(res, o);

            schemaDefinition._type = { type: String, enum:type, default:type};

            var schema = new Schema(schemaDefinition);
            schema.statics.filters = {_type: type};
            schema.definition = schemaDefinition;
            return schema;
        },
        inherit:function(schema){
            _.merge(schema.statics, BaseModel.schema.statics);
            _.merge(schema.methods, BaseModel.schema.methods);
        }
    }
};
