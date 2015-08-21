var _ = require('lodash');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function(BaseSchema){
    return {
        statics:function (proto, arr){
            arr.forEach(function(keyFunc){
                proto[keyFunc] = BaseSchema.statics[keyFunc];
            });
        },
        
        /**
            This method inherits from BaseSchema
            - it adds a type property on childSchema
            - the corresponding filter type on statics
            - and the schema defined on ModelSchema.schema

            @param o : childSchema definition
            @param type: type of child
        */
        schema:function(o, type){
            if(typeof(BaseSchema.innerSchema) == 'undefined'){
                var e = new Error('schema not found for '+BaseSchema);
                console.log(e.stack);
                throw e;
            }
            var res = _.clone(BaseSchema.innerSchema);
            var schemaDefinition = _.assign(res, o);

            schemaDefinition._type = { type: String, enum:type, default:type};

            var schema = new Schema(schemaDefinition);
            schema.statics.filters = {_type: type};
            schema.definition = schemaDefinition;
            return schema;
        },
        inherit:function(schema){
            _.merge(schema.statics, BaseSchema.statics);
            _.merge(schema.methods, BaseSchema.methods);
        }
    }
};
