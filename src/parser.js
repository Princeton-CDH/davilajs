const mysql = {
    regex: {
        tablename: /CREATE\sTABLE\s`(\w+)`[^]*/g,
        table_attribute: /^\s+`(\w+)`\s+(\w+[\d()]*)\s(.*),$/gm,
        foreign_key: /FOREIGN\sKEY\s\(`(\w+)`\)\sREFERENCES\s`(\w+)`/g,
        primary_key: /PRIMARY\sKEY\s\(`([\w,`]+)`\)/g,
    },
    parse(schema) {
        // parse mysql schema
        let entities = []
        let relationships = []
        let match, keymatch, pkeymatch, attrmatch
        // look for table names and generate a list of entities
        while ((match = this.regex.tablename.exec(schema)) !== null) {
            let table_name = match[1],
                table_details = match[0]
            let entity = {
                id: table_name, fields: Array()
            }
            // gather field details for the table
            // identify primary key(s)
            let primary_keys = []
            while ((pkeymatch = this.regex.primary_key.exec(table_details)) !== null) {
                // split on `,` to identify all fields in composite primary keys
                primary_keys = primary_keys.concat(pkeymatch[1].split("`,`"))
            }
            // gather foreign keys and relationships
            let foreign_keys = []
            while ((keymatch = this.regex.foreign_key.exec(table_details)) !== null) {
                let foreign_key = keymatch[1], ref_table = keymatch[2]
                relationships.push({'source': table_name, 'target': ref_table, 'value': 1})
                foreign_keys.push(foreign_key)
            }
            // look for attribute name and type
            while ((attrmatch = this.regex.table_attribute.exec(table_details)) !== null) {
                let attr_name = attrmatch[1], attr_type = attrmatch[2]
                let entity_info = {
                    name: attr_name, type: attr_type
                }
                if (primary_keys.includes(attr_name)) {
                    entity_info.attributes = 'primary key'
                } else if (foreign_keys.includes(attr_name)) {
                    entity_info.attributes = 'foreign key'
                }
                entity.fields.push(entity_info)
            }
            entities.push(entity)
        }
        return {
            'entities': entities,
            'relationships': relationships
        }
    }
}

export default mysql
