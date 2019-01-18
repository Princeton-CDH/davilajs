
import snippets from '../fixtures/snippets'
import { mysql } from '../../src/parser'

describe('myql.parse', () => {
  it('should find table name', function () {
    let info = mysql.parse(snippets.djangoSite)
    expect(info.entities).toHaveLength(1)
    expect(info.entities[0].id).toEqual('django_site')
  })

  it('should find multiple table names', function () {
    let info = mysql.parse(`${snippets.djangoSite}\n ${snippets.footnotesBibliography}`)
    expect(info.entities).toHaveLength(2)
    expect(info.entities[0].id).toEqual('django_site')
    expect(info.entities[1].id).toEqual('footnotes_bibliography')
  })

  it('should find table attributes', function () {
    let info = mysql.parse(snippets.footnotesBibliography)
    let table = info.entities[0]
    expect(table.fields).toHaveLength(4)
    expect(table.fields[0].name).toEqual('id')
    expect(table.fields[1].name).toEqual('notes')
    expect(table.fields[2].name).toEqual('bibliographic_note')
    expect(table.fields[3].name).toEqual('source_type_id')
  })

  it('should find table attribute types', function () {
    let info = mysql.parse(snippets.footnotesBibliography)
    let table = info.entities[0]
    expect(table.fields).toHaveLength(4)
    expect(table.fields[0].type).toEqual('int(11)')
    expect(table.fields[1].type).toEqual('longtext')
    expect(table.fields[2].type).toEqual('longtext')
    expect(table.fields[3].type).toEqual('int(11)')
  })

  it('should recognize primary key', function () {
    let info = mysql.parse(snippets.footnotesBibliography)
    let table = info.entities[0]
    expect(table.fields[0].attributes).toEqual('primary key')
  })

  it('should handle composite primary key', function () {
    let info = mysql.parse(snippets.compositePrimaryKey)
    let table = info.entities[0]
    expect(table.fields[0].attributes).toEqual('primary key')
    expect(table.fields[1].attributes).toEqual('primary key')
  })

  it('should find foreign key relationships', function () {
    let info = mysql.parse(snippets.footnotesBibliography)
    expect(info.relationships).toHaveLength(1)
    expect(info.relationships[0].source).toEqual('footnotes_bibliography')
    expect(info.relationships[0].target).toEqual('footnotes_sourcetype')
  })

  it('should find multiple foreign key relationships', function () {
    let info = mysql.parse(snippets.derridaBooks)
    expect(info.relationships).toHaveLength(4)
    expect(info.relationships[0].source).toEqual('books_book')
    expect(info.relationships[0].target).toEqual('books_itemtype')
    expect(info.relationships[1].source).toEqual('books_book')
    expect(info.relationships[1].target).toEqual('books_journal')
    expect(info.relationships[2].source).toEqual('books_book')
    expect(info.relationships[2].target).toEqual('places_place')
    expect(info.relationships[3].source).toEqual('books_book')
    expect(info.relationships[3].target).toEqual('books_publisher')
  })

  it('should identify foreign key attributes', function () {
    let info = mysql.parse(snippets.footnotesBibliography)
    let table = info.entities[0]
    expect(table.fields[3].attributes).toEqual('foreign key')
  })
})
