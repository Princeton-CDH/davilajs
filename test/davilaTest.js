require('./setup')

if (typeof process === 'object') {  // node environment
  davila = require('../src/davila.js').davila;
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
        sandbox.mock(d3, 'forceSimulation');
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
        // simulation.stop();

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
        davila.display(graph);

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
        davila.display(graph);

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
        davila.display(graph);

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


      it('should display relationships as links', function() {
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
        var simulation = davila.display(graph);
        // should create link container
        assert.equal(d3.selectAll('g.links').size(), 1);
        // create one link for each relationship
        assert.equal(d3.selectAll('g.links line').size(), graph.relationships.length);
      });

});