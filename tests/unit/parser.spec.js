import { assert } from 'chai'

import snippets from '../fixtures/snippets'
import { mysql } from '../../src/parser'


describe('myql.parse', () => {

  it('should find table name', function() {
        let info = mysql.parse(snippets.djangoSite)
        assert.equal(info.entities.length, 1)
        assert.equal(info.entities[0].id, 'django_site')
  })

  it('should find multiple table names', function() {
        let info = mysql.parse(`${snippets.djangoSite}\n ${snippets.footnotesBibliography}`)
        assert.equal(info.entities.length, 2)
        assert.equal(info.entities[0].id, 'django_site')
        assert.equal(info.entities[1].id, 'footnotes_bibliography')
  })
  it('should find table attributes', function() {
        let info = mysql.parse(snippets.footnotesBibliography)
        let table = info.entities[0]
        assert.equal(table.fields.length, 4)
        assert.equal(table.fields[0].name, 'id')
        assert.equal(table.fields[1].name, 'notes')
        assert.equal(table.fields[2].name, 'bibliographic_note')
        assert.equal(table.fields[3].name, 'source_type_id')

  })
  it('should find table attribute types', function() {
        let info = mysql.parse(snippets.footnotesBibliography)
        let table = info.entities[0]
        assert.equal(table.fields.length, 4)
        assert.equal(table.fields[0].type, 'int(11)')
        assert.equal(table.fields[1].type, 'longtext')
        assert.equal(table.fields[2].type, 'longtext')
        assert.equal(table.fields[3].type, 'int(11)')
  })
  it('should recognize primary key', function() {
        let info = mysql.parse(snippets.footnotesBibliography)
        let table = info.entities[0]
        assert.equal(table.fields[0].attributes, 'primary key')
  })
  it('should handle composite primary key', function() {
        let info = mysql.parse(snippets.compositePrimaryKey)
        let table = info.entities[0]
        assert.equal(table.fields[0].attributes, 'primary key')
        assert.equal(table.fields[1].attributes, 'primary key')
  })
  it('should find foreign key relationships', function() {
    let info = mysql.parse(snippets.footnotesBibliography)
    assert.equal(info.relationships.length, 1)
    assert.equal(info.relationships[0].source, "footnotes_bibliography")
    assert.equal(info.relationships[0].target, "footnotes_sourcetype")
  })
  it('should find multiple foreign key relationships', function() {
    let info = mysql.parse(snippets.derridaBooks)
    assert.equal(info.relationships.length, 4)
    assert.equal(info.relationships[0].source, "books_book")
    assert.equal(info.relationships[0].target, "books_itemtype")
    assert.equal(info.relationships[1].source, "books_book")
    assert.equal(info.relationships[1].target, "books_journal")
    assert.equal(info.relationships[2].source, "books_book")
    assert.equal(info.relationships[2].target, "places_place")
    assert.equal(info.relationships[3].source, "books_book")
    assert.equal(info.relationships[3].target, "books_publisher")
  })
  it('should identify foreign key attributes', function() {
    let info = mysql.parse(snippets.footnotesBibliography)
    let table = info.entities[0]
    assert.equal(table.fields[3].attributes, 'foreign key')
  })

})
