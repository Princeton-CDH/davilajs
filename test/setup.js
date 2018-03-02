if (typeof process === 'object') {
  // Initialize node environment
  global.assert = require('chai').assert;
  global.sinon = require('sinon');
  global.jsdom = require('mocha-jsdom');

  global.d3 = require('d3');
  global.load_fixture = require('./utils.js').load_fixture;


} else {
  window.assert = window.chai.assert;
  window.require = function () { /* noop */ }
}