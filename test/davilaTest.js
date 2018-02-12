if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main !== module) {
  chai = require('chai');
  jsdom = require('mocha-jsdom');
  // load d3 when running on command-line (e.g. for unit tests via mocha)
  d3 = require('d3');

  davila = require('../src/davila.js').davila;
}

var assert = chai.assert;

describe('davila.display', function() {
    // initialize jsdom when not running in the browser
    if (typeof document != 'object') {
       jsdom();
    }

    before(function(done) {
        // TODO: create init davila container function in test utils
        var svg = document.createElement('svg');
        svg.setAttribute('class', 'd3');
        var container = document.createElement('div');
        container.setAttribute('class', 'container');
        document.body.appendChild(container);
        document.body.appendChild(svg);
        done();
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
        davila.display(graph);
        // TODO: need some way to turn off/end the simulation?
        // (test seems to be waiting for it)

        // assert.equal(d3.select('.entity h2').text(), graph.entities[0].id);
        d3.selectAll('.entity h2').each(function(d, i) {
            assert.equal(d3.select(this).text(), graph.entities[i].id);
        })
      });

      it('should display entity attributes and data types');

      it('should display entity detail display when toggle is clicked');

      it('should display relationships as links');

});