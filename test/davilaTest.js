require('./setup')

if (typeof process === 'object') {  // node environment
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

describe('davila.display', function() {
  if (typeof jsdom !== 'undefined') {
    jsdom();
  }
  var container, svg, sandbox;

  before(function(done) {
    sandbox = sinon.createSandbox(sinon.defaultConfig);
    done();
  });

    beforeEach(function(done) {
        // TODO: create init davila container function in test utils
       svg = document.createElement('svg');
        svg.setAttribute('class', 'd3');
        container = document.createElement('div');
        container.setAttribute('class', 'container');
        document.body.appendChild(container);
        document.body.appendChild(svg);

        // spy on d3.forcesimulation to allow inspection
        sandbox.spy(d3, 'forceSimulation');
        // NOTE: if it is possible to spy on the simulation that is returned
        // that would make some tests much easier

        done();
    });

    afterEach(function() {
      d3.selectAll('.links').remove();
      d3.selectAll('.entities').remove();
      document.body.removeChild(container);
      document.body.removeChild(svg);

      sandbox.restore();
    });

     it('should display entity name', function() {
        // mini dataset with just two entities; no relationships or fields
        var graph = {
            entities: [
                {id: 'something'},
                {id: 'another'}
            ],
            relationships: []
        };
        var simulation = davila.display(graph, {autostart: false});
        // assert.equal(d3.select('.entity h2').text(), graph.entities[0].id);
        d3.selectAll('.entity h2').each(function(d, i) {
            assert.equal(d3.select(this).text(), graph.entities[i].id);
        })
      });

      it('should display entity field data types', function() {
         var graph = {
            entities: [
                {id: 'something', fields: [
                  {name: "id", type: "int(11)"},
                  {name: "name", type: "varchar(200)"},
                  {name: "notes", type: "longtext"}
                ]},
            ],
            relationships: []
          };
        davila.display(graph, {autostart: false});

        // check that field names and types have been added to the document
        // for display
        d3.selectAll('li.fields').each(function(d, i) {
          assert.equal(d3.select(this).select('.name').text(), graph.entities[0].fields[i].name);
          assert.equal(d3.select(this).select('.type').text(), graph.entities[0].fields[i].type);

        });
      });

      it('should display entity detail display when toggle is clicked', function() {
        var graph = {
            entities: [
                {id: 'something', fields: [
                  {name: "id", type: "int(11)"},
                ]},
            ],
            relationships: []
          };
        davila.display(graph, {autostart: false});

        assert.notInclude(d3.select('.entity').attr('class'), 'details');

        d3.select('.entity .detail-toggle').dispatch("click");
        assert.include(d3.select('.entity').attr('class'), 'details');
      });

      it('should display entity field attributes (primary/foreign key)', function() {
         var graph = {
            entities: [
                {id: 'something', fields: [
                  {name: "id", type: "int(11)", attributes: 'primary key'},
                  {name: "person_id", type: "int(11)'", attributes: 'foreign key'},
                  {name: "notes", type: "longtext"}
                ]},
            ],
            relationships: []
          };

        davila.display(graph, {autostart: false});

        // check that additional information has been set as
        // extra class on the field display element
        d3.selectAll('li.fields').each(function(d, i) {
          var field = graph.entities[0].fields[i];
          if (field.attributes) {
            assert.equal(d3.select(this).attr('class'),
              'fields ' + field.attributes.replace(' ', '-'));
          } else {
            assert.equal(d3.select(this).attr('class'), 'fields');
          }

        });
      });

     // simple entity relationship graph used for following tests
     var graph = {
            entities: [
                {id: 'something'},
                {id: 'another'},
                {id: 'third'}
            ],
            relationships: [
              {source: 'something', target: 'another'},
              {source: 'something', target: 'third'}
            ]
      };

      it('should display relationships as links', function() {
        var display_obj = davila.display(graph, {autostart: false});
        // should create link container
        assert.equal(d3.selectAll('g.links').size(), 1);
        // create one link for each relationship
        assert.equal(d3.selectAll('g.links line').size(), graph.relationships.length);
      });

      it('should initialize d3 force simulation', function() {
        var display_object = davila.display(graph, {autostart: false});
        var simulation = display_object.simulation;
        assert(d3.forceSimulation.called);
        // nodes and links should be set on the simulation based on graph
        assert.equal(simulation.nodes().length, graph.entities.length);
        assert.equal(simulation.force('link').links().length, graph.relationships.length);
        // assert some function set for charge
        assert(simulation.force('charge'));
        // assert some function set for center
        assert(simulation.force('center'));
      });

      it('should return an object with access to simulation, handlers, etc', function() {
        var display_obj = davila.display(graph, {autostart: false});
        assert.exists(display_obj.simulation);
        assert.equal(display_obj.node_divs.size(), graph.entities.length);
        assert.equal(display_obj.link_lines.size(), graph.relationships.length);
        assert.exists(display_obj.handlers);
        assert.exists(display_obj.handlers.dragged);  // spot-check, not checking all
      });

      it('should start the d3 force simulation by default', function() {
        // FIXME: how to test this?
        // stub doesn't spy on returned objects, otherwise could check
        // whether or not simulation.stop is called;
        // could check simulation.alpha() value, but requires delay
        // and doesn't seem to work on command line
        var display_object = davila.display(graph);
        var display_object = davila.display(graph, {autostart: false});
      });

      it('should update node positions on simulation tick', function() {
        var display_object = davila.display(graph, {autostart: false});
        var simulation = display_object.simulation;
        // retrieve simulation 'tick' event handler and call it
        simulation.on('tick')();

        // get first node from the simulation and first entity div object
        var node = simulation.nodes()[0];
        var entity = d3.select('.entity');
        // note: not taking into account offset width/height ?
        // entity should be positioned based on node simulation
        assert.equal(entity.style('left'), node.x + 'px');
        assert.equal(entity.style('top'), node.y + 'px');

        // get first link from simulation and first svg line
        var link = simulation.force('link').links()[0];
        var line = d3.select('.links line');
        // should be positioned based on source/target nodes
        assert.equal(line.attr('x1'), link.source.x);
        assert.equal(line.attr('y1'), link.source.y);
        assert.equal(line.attr('x2'), link.target.x);
        assert.equal(line.attr('y2'), link.target.y);
      });

      it('should allow entities to be dragged', function() {
        // standard d3 forcesimulation drag start / drag end behavior

        var display_obj = davila.display(graph, {autostart: false});
        // grab first node from the simulation
        var node = display_obj.simulation.nodes()[0];
        // set x and y so there are values to compare against
        node.x = 15, node.y = 22;

        // drag start
        // return mock event for handler to check
        sandbox.stub(d3, 'event').value({active: true});
        display_obj.handlers.dragstarted(node);
        // alpha target unchanged
        assert.equal(display_obj.simulation.alphaTarget(), 0);
        assert.equal(node.fx, node.x);
        assert.equal(node.fy, node.y);

        // when not event active, alpha target changed
        sandbox.stub(d3, 'event').value({active: false});
        display_obj.handlers.dragstarted(node);
        assert.equal(display_obj.simulation.alphaTarget(), 0.3);

        // drag end
        node.x = 1, node.y = 2;
        display_obj.handlers.dragended(node);
        assert.equal(display_obj.simulation.alphaTarget(), 0);
        assert.equal(node.fx, node.x);
        assert.equal(node.fy, node.y);
        // alpha set to zero when event is not active
        display_obj.simulation.alphaTarget(0.5);
        sandbox.stub(d3, 'event').value({active: false});
      });

      it('should make entity position sticky after drag', function() {
        var display_obj = davila.display(graph, {autostart: false});
        // grab first node from the simulation
        var node = display_obj.simulation.nodes()[0];
        // create mock drag event and call drag handler
        var mock_drag = {x: 15, y: 33};
        sandbox.stub(d3, 'event').value(mock_drag);
        display_obj.handlers.dragged(node);
        // fixed x and y coordinates should be set from event
        assert.equal(node.fx, mock_drag.x);
        assert.equal(node.fy, mock_drag.y);
      });

      it('should release sticky node position on right click', function() {
        var display_object = davila.display(graph, {autostart: false});
        var simulation = display_object.simulation;
        simulation.on('tick')();

        // get first simulation node and html entity div
        var entity = d3.select('.entity');
        var node = simulation.nodes()[0];

        // custom event to simulate context menu
        var rightclick_event = new CustomEvent('contextmenu', {target: entity});
        rightclick_event.preventDefault = sinon.spy();
        // patch event object into d3.event
        sandbox.stub(d3, 'event').value(rightclick_event);
        // set fixed x,y values to check they are cleared
        node.fx = 1, node.fy = 2;

        // retrieve contextmenu event handler and trigger with node as data
        entity.on('contextmenu')(node);
        // fixed x,y coords should be cleared
        assert.equal(node.fx, null);
        assert.equal(node.fy, null);
        // default context menu behavior skipped
        assert(d3.event.preventDefault.called);
      });




});