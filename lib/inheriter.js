var _ = require('lodash');

module.exports = function(BaseSchema, SchemaConstructor){
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

            var schema = new SchemaConstructor(schemaDefinition);
            schema.statics.filters = {_type: type};
            schema.definition = schemaDefinition;
            schema.innerSchema = schemaDefinition;
            return schema;
        },
        inherit:function(schema){
            schema.statics = _.merge({}, BaseSchema.statics, schema.statics);
            schema.methods = _.merge({}, BaseSchema.methods, schema.methods);
        }
    }
};
