/* global chai.assert; load requirements for node environment */
require('./setup')

if (typeof process === 'object') {  // node environment

  editor = require('../src/editor.js').editor;
  davila = require('../src/davila.js').davila;

  // jsdom doesn't yet include CustomEvent invocation; wrap createEvent
  // for compatibility with in-browser test code
  function CustomEvent (name, opts = {}) {
    let e = document.createEvent('HTMLEvents');
    e.detail = opts.detail;
    e.initEvent(name, opts, opts.bubbles, opts.cancelable);
    return e;
  }

}

// source code loaded via script tag in test runner html
// test utils with load_fixture method loaded in test runner


// variables to store fixture data for schema samples to test
var schema_snippets = {}, derrida_schema;


describe('editor.enable_schema_drop', function() {
  var sandbox;
  if (typeof jsdom !== 'undefined') {
      jsdom();
  }

  before(function(done) {

    var load_derrida_schema = new Promise(function(resolve, reject) {
      load_fixture('fixtures/derrida_schema.sql', function( data ) {
        derrida_schema = data;
        resolve();
        });
    });

    var enable_schema_drop = new Promise(function(resolve, reject) {
        sandbox = sinon.createSandbox(sinon.defaultConfig);

        if (typeof jsdom !== 'undefined') {
          editor.enable_schema_drop();
        } else {
          // currently auto-enabled when running in the browser
          // enable_schema_drop();
        }
        resolve();
    });

     // run all fixture loading promises, then mark before hook as done
    Promise.all([load_derrida_schema, enable_schema_drop]).then(function() {
        done();
    });

  });

  beforeEach(function() {
    // clear out body class before each run
    d3.select('body').attr('class', '');
    sandbox.stub(davila, 'display');
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('should handle dragenter event', function() {
    var dragenter_event = new CustomEvent('dragenter', {target: document.body});
    dragenter_event.preventDefault = sinon.spy();
    dragenter_event.stopPropagation = sinon.spy();
    dragenter_event.dataTransfer = sinon.stub();

    // patch event object into d3.event
    sandbox.stub(d3, 'event').value(dragenter_event);

    // trigger the event
    document.body.dispatchEvent(dragenter_event);

    // body should have drog active class
    assert.equal(d3.select('body').attr('class'), 'active');
    // prevent default & stop propagation should be called
    assert(d3.event.preventDefault.called);
    assert(d3.event.stopPropagation.called);
    assert.equal(d3.event.dataTransfer.dropEffect, 'copy')
  });

  it('should handle dragover event', function() {
    // create drag-enter event and spy on methods
    var dragover_event = new CustomEvent('dragover', {target: document.body});
    dragover_event.preventDefault = sinon.spy();
    dragover_event.stopPropagation = sinon.spy();
    dragover_event.dataTransfer = sinon.stub();

    // patch event object into d3.event
    sandbox.stub(d3, 'event').value(dragover_event);
    // trigger the event
    document.body.dispatchEvent(dragover_event);

    // body should have drog active class
    assert.equal(d3.select('body').attr('class'), 'active');
    // prevent default & stop propagation should be called
    assert(d3.event.preventDefault.called);
    assert(d3.event.stopPropagation.called);
    assert.equal(d3.event.dataTransfer.dropEffect, 'copy')
  });

  it('should handle dragleave event', function() {
    // set class to active to test that it gets cleared
    d3.select('body').attr('class', 'active');

    var dragleave_event = new CustomEvent('dragleave', {target: document.body});
    document.body.dispatchEvent(dragleave_event);

    assert.equal(d3.select('body').attr('class'), '');
  });

  it('should handle drop event (no files)', function() {
    d3.select('body').attr('class', 'active');
    var drop_event = new CustomEvent('drop', {target: document.body});
    drop_event.preventDefault = sinon.spy();
    drop_event.stopPropagation = sinon.spy();
    drop_event.dataTransfer = sinon.stub();
    drop_event.dataTransfer.files = [];

    // create hidden file list element for logging dropped file
    d3.select('body').append('div').attr('id', 'file-list')
        .attr('style', 'display: none');

    // patch event object into d3.event
    sandbox.stub(d3, 'event').value(drop_event);

    // test with no files
    drop_event.dataTransfer.files = [];
    document.body.dispatchEvent(drop_event);
    assert(d3.event.preventDefault.called);
    assert(d3.event.stopPropagation.called);
    assert.equal(d3.select('body').attr('class'), '');
  });

  it('should handle drop event (no content)', function() {
    var drop_event = new CustomEvent('drop', {target: document.body});
    drop_event.preventDefault = sinon.spy();
    drop_event.stopPropagation = sinon.spy();
    drop_event.dataTransfer = sinon.stub();
    drop_event.dataTransfer.files = [];

    // create hidden file list element for logging dropped file
    d3.select('body').append('div').attr('id', 'file-list')
        .attr('style', 'display: none');

    // patch event object into d3.event
    sandbox.stub(d3, 'event').value(drop_event);

    // test with simulated file dropped
    // create stub for dropped file & associate with event
    var dropfile = sinon.stub({name: 'myschema.sql', size: 1000});
    drop_event.dataTransfer.files = [dropfile];
    // stub file reader object
    var file_content = '';
    var filereader_readastext = sandbox.stub(FileReader.prototype, 'readAsText').callsFake(
        function() {
        this.result = '';
        this.onload({ target: { result: this.result}});
    });
    // empty file - should not error
    document.body.dispatchEvent(drop_event);
    // read as text should have been called
    assert(filereader_readastext.called);
    assert(filereader_readastext.calledWith(dropfile));
    // davila display should not be called when no entities are found
    assert(! davila.display.called);
    // current implementation displays dropped file name and size
    // in the file-list element
    var file_list_text = d3.select('#file-list').text();
    assert(file_list_text.includes(dropfile.name));
    assert(file_list_text.includes(dropfile.size));

  });

  it('should handle drop event (sql schema content)', function() {
    var drop_event = new CustomEvent('drop', {target: document.body});
    drop_event.preventDefault = sinon.spy();
    drop_event.stopPropagation = sinon.spy();
    drop_event.dataTransfer = sinon.stub();
    drop_event.dataTransfer.files = [];

    // create hidden file list element for logging dropped file
    d3.select('body').append('div').attr('id', 'file-list')
        .attr('style', 'display: none');

    // patch event object into d3.event
    sandbox.stub(d3, 'event').value(drop_event);

    // test with simulated file dropped
    // create stub for dropped file & associate with event
    var dropfile = sinon.stub({name: 'myschema.sql', size: 1000});
    drop_event.dataTransfer.files = [dropfile];
    // stub file reader object
    var filereader_readastext = sandbox.stub(FileReader.prototype, 'readAsText').callsFake(
        function() {
        this.result = derrida_schema;
        this.onload({ target: { result: derrida_schema}});
    });

    document.body.dispatchEvent(drop_event);
    assert(filereader_readastext.called);
    assert(filereader_readastext.calledWith(dropfile));

    assert(davila.display.called);
    // called with entity & relationship object returned by parse
    assert(davila.display.getCall(0).args[0].entities);
    assert(davila.display.getCall(0).args[0].relationships);

    // undo stub
    filereader_readastext.restore();
  });

});


describe('editor.get_querystring_opts', function() {

  it('should not error with no query string params', function() {
      editor.get_querystring_opts('');
      editor.get_querystring_opts('?');
      // no easy way to test empty object
  });
  it('should handle one query string param', function() {
      var opts = editor.get_querystring_opts('?foo=bar');
      assert.equal(opts.foo, 'bar');
  });
  it('should handle multiple query string params', function() {
      var opts = editor.get_querystring_opts('?foo=bar&baz=qux');
      assert.equal(opts.foo, 'bar');
      assert.equal(opts.baz, 'qux');
  });
});

describe('editor.parse_uri', function() {
  var sandbox;
  if (typeof jsdom !== 'undefined') {
      jsdom();
  }

   before(function(done) {
        sandbox = sinon.createSandbox(sinon.defaultConfig);
        done();
  });

  beforeEach(function() {
    sandbox.stub(editor, 'parse_and_display');
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('should load a uri for parse and display', function(){
    // stub d3.text and set to call callback method
    var d3_text = sandbox.stub(d3, 'text').callsArgWith(1, 0, derrida_schema);
    var test_uri = 'http://example.com/schema.sql';
    editor.parse_uri(test_uri);
    assert(d3_text.calledWith(test_uri));
    assert(editor.parse_and_display.called);
    assert(editor.parse_and_display.calledWith(derrida_schema));

    // todo: test error handling
  });

});


describe('editor.parse_and_display', function() {
  var sandbox;
  if (typeof jsdom !== 'undefined') {
      jsdom();
  }

   before(function(done) {
        sandbox = sinon.createSandbox(sinon.defaultConfig);
        done();
  });

  beforeEach(function() {
    sandbox.stub(davila, 'display');
    // NOTE: not currently stubbing parse method (but probably should)
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('should parse but not display empty schema', function() {
    editor.parse_and_display('');
    assert(! davila.display.called);
  });

  it('should parse and display schema with entities', function() {
    editor.parse_and_display(derrida_schema);
    assert(davila.display.called);
  });

});
