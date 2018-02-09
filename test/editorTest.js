if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main !== module) {
  // tests running on command-line via mocha

  chai = require('chai');
  jsdom = require('mocha-jsdom');

  sinon = require('sinon');

  // initialize jsdom when not running in the browser
  jsdom();

  editor = require('../src/editor.js').editor;

  // jsdom doesn't yet include CustomEvent invocation; wrap createEvent
  // for compatibility with in-browser test code
  function CustomEvent (name, opts = {}) {
    let e = document.createEvent('HTMLEvents');
    e.detail = opts.detail;
    e.initEvent(name, opts, opts.bubbles, opts.cancelable);
    return e;
  }

  // copied from parseTest
 function load_fixture(filename, callback) {
    // utility method to load fixture files relative to the
    // directory where this test file is located
    fs.readFile(__dirname + '/' + filename, function(err, data) {
      callback(data.toString());
    });
  }

} else {

  // source code loaded via script tag in test runner html

  function load_fixture(filename, callback) {
    // utility method to load fixture files
    var relative_path = "/test/" + filename;
    var load_method;
    // load as xml if the filename includes .xml
    if (filename.indexOf('.xml') !== -1) {
      load_method = d3.xml;
    //otherwise load as text
    } else {
      load_method = d3.text;
    }

    load_method(relative_path, function(error, data) {
      if (error) throw error;
      callback(data);
    })
  }
}

var assert = chai.assert;

// variables to store fixture data for schema samples to test
var schema_snippets = {}, derrida_schema;


describe('editor.enable_schema_drop', function() {

  var sandbox;

  before(function(done) {

    var load_derrida_schema = new Promise(function(resolve, reject) {
      load_fixture('fixtures/derrida_schema.sql', function( data ) {
        derrida_schema = data;
        resolve();
        });
    });

    var enable_schema_drop = new Promise(function(resolve, reject) {
        sandbox = sinon.createSandbox(sinon.defaultConfig);

        if (typeof jsdom != 'undefined') {
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

  it('should handle drop event', function() {
    var drop_event = new CustomEvent('drop', {target: document.body});
    drop_event.preventDefault = sinon.spy();
    drop_event.stopPropagation = sinon.spy();
    drop_event.dataTransfer = sinon.stub();
    drop_event.dataTransfer.files = [];

    // create file list element for logging file
    d3.select('body').append('div').attr('id', 'file-list');

    // patch event object into d3.event
    sandbox.stub(d3, 'event').value(drop_event);

    // test with no files
    drop_event.dataTransfer.files = [];
    document.body.dispatchEvent(drop_event);
    assert(d3.event.preventDefault.called);
    assert(d3.event.stopPropagation.called);

    // test with simulated file dropped
    // create stub for dropped file & associate with event
    var dropfile = sinon.stub({name: 'myschema.sql', size: 1000});
    drop_event.dataTransfer.files = [dropfile];
    // stub file reader object
    var file_content = '';
    var filereader_readastext = sandbox.stub(FileReader.prototype, 'readAsText').callsFake(function() {
        this.result = derrida_schema;
        this.onload({ target: { result: derrida_schema}});
    });
    // empty file - should not error
    document.body.dispatchEvent(drop_event);
    // read as text should have been called
    assert(filereader_readastext.called);


    filereader_readastext.restore();

  });

});