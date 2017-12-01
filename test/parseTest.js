// var chai = require('chai');
var assert = chai.assert;

// load fixture data for schema samples to test
var schema_snippets = {}, derrida_schema;

$.get( "/test/fixtures/schema_snippets.xml", function( data ) {
  console.log('data');
  console.log($(data).find('snippet'));
  var snippets = $(data).find('snippet');
  console.log(snippets);
  for (var i = 0; i < snippets.length; i++) {
    var snippet = $(snippets[i]);
    schema_snippets[snippet.attr('id')] = snippet.text();
  }
});

$.get( "/test/fixtures/derrida_schema.sql", function( data ) {
  derrida_schema = data;
});


describe('schema.parse', function() {
  it('should find table name', function() {
        // var info = parse(sample_schema);
        var info = parse(schema_snippets['django_site']);
        assert.equal(info.entities.length, 1);
        assert.equal(info.entities[0].id, 'django_site');
  });
  it('should find multiple table names', function() {
        var info = parse(schema_snippets['django_site'] + '\n ' +
          schema_snippets['footnotes_bibliography']);
        assert.equal(info.entities.length, 2);
        assert.equal(info.entities[0].id, 'django_site');
        assert.equal(info.entities[1].id, 'footnotes_bibliography');
  });
  it('should find foreign key relationships', function() {
    var info = parse(schema_snippets['footnotes_bibliography']);
    assert.equal(info.relationships.length, 1);
    assert.equal(info.relationships[0].source, "footnotes_bibliography");
    assert.equal(info.relationships[0].target, "footnotes_sourcetype");
  });
  it('should find multiple foreign key relationships', function() {
    var info = parse(schema_snippets['derrida_books']);
    assert.equal(info.relationships.length, 4);
    assert.equal(info.relationships[0].source, "books_book");
    assert.equal(info.relationships[0].target, "books_itemtype");
    assert.equal(info.relationships[1].source, "books_book");
    assert.equal(info.relationships[1].target, "books_journal");
    assert.equal(info.relationships[2].source, "books_book");
    assert.equal(info.relationships[2].target, "places_place");
    assert.equal(info.relationships[3].source, "books_book");
    assert.equal(info.relationships[3].target, "books_publisher");
  });
  it('should find multiple foreign key relationships in different tables', function() {
        var info = parse(derrida_schema);
        assert.equal(info.entities.length, 49);
        assert.equal(info.relationships.length, 57);
  });
});
