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

      it('should display entity attributes and data types');

      it('should display entity detail display when toggle is clicked');

      it('should display relationships as links');

});