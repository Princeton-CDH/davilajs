/* Parse a schema and return an entity relationship structure in this
  format:
{
    entities: [
        {id: entity_name, fields: [
            {name: attr_name, type: type},
            {name: attr2_name, type: type},
        ]}
    ],
    relationships: [
        {source: entity1, target: entity2},
    ]
}

*/

var mysql_regex = {
    tablename: /CREATE\sTABLE\s`(\w+)`[^;]*;/g,
    table_attribute: /^\s+`(\w+)`\s+(\w+[\d()]*)\s(.*),$/gm,
    foreign_key: /FOREIGN\sKEY\s\(`(\w+)`\)\sREFERENCES\s`(\w+)`/g
};


function parse(schema) {
    // parse mysql schema
    var entities = [];
    var relationships = []
    var match, keymatch;
    // look for table names and generate a list of entities
    while ((match = mysql_regex.tablename.exec(schema)) !== null) {
        var table_name = match[1],
            table_details = match[0];
        var entity = {id: table_name, fields: Array()};

        // gather field details for the table
        // look for attribute name and type
        while ((attrmatch = mysql_regex.table_attribute.exec(table_details)) !== null) {
            var attr_name = attrmatch[1], attr_type = attrmatch[2];
            entity.fields.push({name: attr_name, type: attr_type});
        }
        entities.push(entity);

        // look for foreign keys within the table definition
        while ((keymatch = mysql_regex.foreign_key.exec(table_details)) !== null) {
            relationships.push({'source': table_name, 'target': keymatch[2], 'value': 1})
        }

    }
    return {
        'entities': entities,
        'relationships': relationships
    };
}

// export as node module when running under npm / command line
if (typeof exports !== 'undefined') {
    exports.parse = parse;
}

