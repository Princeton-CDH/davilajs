if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main !== module) {
  // tests running on command-line via mocha

  chai = require('chai');
  parse = require('../src/parse.js').parse;

  var fs = require('fs'),
      xml2js = require('xml2js');

  function load_fixture(filename, callback) {
    // utility method to load fixture files relative to the
    // directory where this test file is located
    fs.readFile(__dirname + '/' + filename, function(err, data) {
      callback(data.toString());
    });
  }


} else {
  // tests running in the browser

  function load_fixture(filename, callback) {
    // utility method to load fixture files
    $.get( "/test/" + filename, function(data) {
      callback(data);
    });
  }
}

var assert = chai.assert;

// variables to store fixture data for schema samples to test
var schema_snippets = {}, derrida_schema;


describe('schema.parse', function() {

  before(function(done) {
    var load_derrida_schema = new Promise(function(resolve, reject) {
      load_fixture('fixtures/derrida_schema.sql', function( data ) {
        derrida_schema = data;
        resolve();
        });
    });

    var load_schema_snippets = new Promise(function(resolve, reject) {
      load_fixture('fixtures/schema_snippets.xml', function(data) {

         // if running on the command line, parse schema snippets from xml fixture
        if (xml2js) {
          var parser = new xml2js.Parser();
          parser.parseString(data, function (err, result) {
              for (var i = 0; i < result.schema_snippets.snippet.length; i++) {
                var snippet = result.schema_snippets.snippet[i];
                schema_snippets[snippet['$'].id] = snippet._;
              }
            resolve();
          });

        // if running in the browser, use jquery to parse snippets from xml fixture
        } else {
          var snippets = $(data).find('snippet');
          for (var i = 0; i < snippets.length; i++) {
            var snippet = $(snippets[i]);
            schema_snippets[snippet.attr('id')] = snippet.text();
          }
          resolve();
        }
      }); // end load fixture
    }); // end load_schema_snippets

    // run all fixture loading promises, then mark before hook as done
    Promise.all([load_derrida_schema, load_schema_snippets]).then(function() {
      done();
    });

  });

  it('should find table name', function() {
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
  it('should find table attributes', function() {
        var info = parse(schema_snippets['footnotes_bibliography']);
        var table = info.entities[0];
        assert.equal(table.fields.length, 4);
        assert.equal(table.fields[0].name, 'id');
        assert.equal(table.fields[1].name, 'notes');
        assert.equal(table.fields[2].name, 'bibliographic_note');
        assert.equal(table.fields[3].name, 'source_type_id');

  });
  it('should find table attribute types', function() {
        var info = parse(schema_snippets['footnotes_bibliography']);
        var table = info.entities[0];
        assert.equal(table.fields.length, 4);
        assert.equal(table.fields[0].type, 'int(11)');
        assert.equal(table.fields[1].type, 'longtext');
        assert.equal(table.fields[2].type, 'longtext');
        assert.equal(table.fields[3].type, 'int(11)');
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
