const mysql = {
  regex: {
    tablename: /CREATE\sTABLE\s`(\w+)`[^;]*;/g,
    table_attribute: /^\s+`(\w+)`\s+(\w+[\d()]*)\s(.*),$/gm,
    foreign_key: /FOREIGN\sKEY\s\(`(\w+)`\)\sREFERENCES\s`(\w+)`/g,
    primary_key: /PRIMARY\sKEY\s\(`([\w,`]+)`\)/g
  },
  parse (schema) {
    // parse mysql schema
    let entities = []
    let relationships = []
    let match, keymatch, pkeymatch, attrmatch
    // look for table names and generate a list of entities
    while ((match = this.regex.tablename.exec(schema)) !== null) {
      let tableName = match[1]
      let tableDetails = match[0]
      let entity = {
        id: tableName, fields: []
      }
      // gather field details for the table
      // identify primary key(s)
      let primaryKeys = []
      while ((pkeymatch = this.regex.primary_key.exec(tableDetails)) !== null) {
        // split on `,` to identify all fields in composite primary keys
        primaryKeys = primaryKeys.concat(pkeymatch[1].split('`,`'))
      }
      // gather foreign keys and relationships
      let foreignKeys = []
      while ((keymatch = this.regex.foreign_key.exec(tableDetails)) !== null) {
        let foreignKey = keymatch[1]
        let refTable = keymatch[2]
        relationships.push({ 'source': tableName, 'target': refTable, 'value': 1 })
        foreignKeys.push(foreignKey)
      }
      // look for attribute name and type
      while ((attrmatch = this.regex.table_attribute.exec(tableDetails)) !== null) {
        let attrName = attrmatch[1]
        let attrType = attrmatch[2]
        let entityInfo = {
          name: attrName, type: attrType
        }
        if (primaryKeys.includes(attrName)) {
          entityInfo.attributes = 'primary key'
        } else if (foreignKeys.includes(attrName)) {
          entityInfo.attributes = 'foreign key'
        }
        entity.fields.push(entityInfo)
      }
      entities.push(entity)
    }
    return {
      'entities': entities,
      'relationships': relationships
    }
  }
}

export {
  mysql
}
