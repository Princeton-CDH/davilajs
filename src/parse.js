var tablename_re = /CREATE\sTABLE\s`(\w+)`[^;]*;/g;
// var foreign_key_re = /CREATE\sTABLE\s`(\w+)`[^;]*FOREIGN\sKEY\s\(`(\w+)`\)\sREFERENCES\s`(\w+)`/gm;
var foreign_key_re = /FOREIGN\sKEY\s\(`(\w+)`\)\sREFERENCES\s`(\w+)`/g;

function parse(schema) {
    // parse mysql schema
    var entities = [];
    var relationships = []
    var match, keymatch;
    // look for table names and generate a list of entities
    while ((match = tablename_re.exec(schema)) !== null) {
        var table = match[1],
            table_details = match[0];
        entities.push({'id': table});

        // todo: gather field details for the table

        // look for foreign keys within the table definition
        while ((keymatch = foreign_key_re.exec(table_details)) !== null) {
            relationships.push({'source': table, 'target': keymatch[2], 'value': 1})
        }

    }

/*    while ((match = foreign_key_re.exec(schema)) !== null) {
        console.log(match);
        relationships.push({'source': match[1], 'target': match[3]})
    }
*/
    console.log(relationships);

  // "relationships": [
    // {"source": "People", "target": "Relationships", "value": 1},
    // {"source": "People", "target": "Nationalities", "value": 1},

    // console.log(entities);
    return {
        'entities': entities,
        'relationships': relationships
    };
}

exports.parse = parse;

