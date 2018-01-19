if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main !== module) {
  // tests running on command-line via mocha

  chai = require('chai');
  jsdom = require('mocha-jsdom');

  sinon = require('sinon');

  // load source code as module
  editor = require('../src/editor.js').editor;
}

var assert = chai.assert;

// variables to store fixture data for schema samples to test
var schema_snippets = {}, derrida_schema;


describe('editor.enable_schema_drop', function() {

  before(function(done) {
    if (typeof jsdom != 'undefined') {
      jsdom();
      editor.enable_schema_drop();
    } else {
      enable_schema_drop();
    }

    done();
  });

  beforeEach(function() {
    // clear out body class before each run
    d3.select('body').attr('class', '');
  });

  it('should handle dragenter event', function() {
    // create drag-enter event and spy on methods
    var dragenter_event = new Event('dragenter', {target: document.body});
    dragenter_event.preventDefault = sinon.spy();
    dragenter_event.stopPropagation = sinon.spy();
    dragenter_event.dataTransfer = sinon.stub();

    // patch event object into d3.event
    d3.event = dragenter_event;
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
    var dragover_event = new Event('dragover', {target: document.body});
    dragover_event.preventDefault = sinon.spy();
    dragover_event.stopPropagation = sinon.spy();
    dragover_event.dataTransfer = sinon.stub();

    // patch event object into d3.event
    d3.event = dragover_event;
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

    var dragleave_event = new Event('dragleave', {target: document.body});
    document.body.dispatchEvent(dragleave_event);

    assert.equal(d3.select('body').attr('class'), '');
  });

  it('should handle drop event', function() {
    var drop_event = new Event('drop', {target: document.body});
    drop_event.preventDefault = sinon.spy();
    drop_event.stopPropagation = sinon.spy();
    drop_event.dataTransfer = sinon.stub();
    drop_event.dataTransfer.files = [];

    // create file list element for logging file
    d3.select('body').append('div').attr('id', 'file-list');

    // test with no files
    drop_event.dataTransfer.files = [];
    document.body.dispatchEvent(drop_event);
    assert(d3.event.preventDefault.called);
    assert(d3.event.stopPropagation.called);

    // TODO: simulate reading file
    // create stub for dropped file
    var dropfile = sinon.stub({name: 'myschema.sql', size: 1000});
    // dropfile.name = 'myschema.sql';
    // dropfile.size = 10000;
    // dropfile.lastModifiedDate ??
    drop_event.dataTransfer.files = [dropfile];

    // document.body.dispatchEvent(drop_event);
  });

});