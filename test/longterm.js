var assert = require('assert');
var expect = require('chai').expect;
var async = require('async');

describe('longterm', function() {

  beforeEach(function() {
    var path = require.resolve('../longterm');
    if (require.cache[path]) delete require.cache[path];
  })

  it('should be chainable', function(done) {
    var longterm = require('../longterm');
    var keys = ['cancel', 'clear', 'init'];
    expect(longterm).to.
      contain.all.keys(keys).
      and.to.respondTo('on')
    longterm.on('test', function(err) {
      expect(this).to.
        contain.all.keys(keys).
        and.to.respondTo('on')
      expect(this.on('b', function() {})).to.
        contain.all.keys(keys).
        and.to.respondTo('on')
      done();
    })
    longterm.schedule('test', Date.now(), function(err) {
      expect(err).to.not.exist;
    })
  })

  it('should throw an error scheduling if there is no handler', function(done) {
    var longterm = require('../longterm');
    longterm.schedule('test', Date.now(), null, function(err) {
      expect(err).to.exist;
      done();
    })
  })
});
