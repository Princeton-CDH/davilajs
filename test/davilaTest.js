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

        // stub out d3.forcesimulation; actually running it
        // causes command line tests to hang
        sandbox.spy(d3, 'forceSimulation');
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
        var simulation = davila.display(graph);
        // stop the simulation so tests don't hang waiting for it to run
        simulation.stop();

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
        var simulation = davila.display(graph);
        simulation.stop();

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
        var simulation = davila.display(graph);
        simulation.stop();

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
        var simulation = davila.display(graph);
        simulation.stop();

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
        var simulation = davila.display(graph);
        simulation.stop();
        // should create link container
        assert.equal(d3.selectAll('g.links').size(), 1);
        // create one link for each relationship
        assert.equal(d3.selectAll('g.links line').size(), graph.relationships.length);
      });

      it('should initialize d3 force simulation', function() {
        var simulation = davila.display(graph);
        simulation.stop();
        assert(d3.forceSimulation.called);
        // nodes and links should be set on the simulation based on graph
        assert.equal(simulation.nodes().length, graph.entities.length);
        assert.equal(simulation.force('link').links().length, graph.relationships.length);
        // assert some function set for charge
        assert(simulation.force('charge'));
        // assert some function set for center
        assert(simulation.force('center'));
      });

      it('should update node positions on simulation tick', function() {
        var simulation = davila.display(graph);
        simulation.stop();
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

      it('should make note position sticky after drag');

      it('should release sticky node position on right click');




});