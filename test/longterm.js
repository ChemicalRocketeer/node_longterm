var assert = require('assert');
var expect = require('chai').expect;
var longterm = require('../longterm');
var async = require('async');

describe('longterm', function() {

  beforeEach(function(done) {
    longterm.clear(function() {
      longterm.removeAllListeners();
      longterm.init();
      done();
    });
  })

  it('should hide the emit function', function(done) {
    var EventEmitter = require('events');
    expect(longterm).to.not.have.property('emit');
    expect(longterm.prototype).to.not.have.property('emit');
    longterm.on('test', function() {
      expect(this).to.have.property('on');
      expect(this).to.not.have.property('emit');
      done();
    })
    longterm('test', Date.now());
  })

  it('should be chainable', function(done) {
    var keys = ['on', 'cancel', 'clear', 'middleware', 'init'];
    expect(longterm.on('a', function() {})).to.contain.all.keys(keys)
    longterm.on('test', function() {
      expect(this).to.contain.all.keys(keys);
      expect(this.on('b', function() {})).to.contain.all.keys(keys)
      done();
    })
    longterm('test', Date.now())
  })

  it('should throw an error scheduling if there is no handler', function(done) {
    longterm('test', Date.now(), null, function(err) {
      expect(err).to.exist;
      done();
    })
  })

  it('should allow setting listeners after scheduling events', function(done) {
    longterm('test', Date.now(), null, function(err) {
      expect(err).to.not.exist;
    })
    longterm.on('test', function() {
      done();
    })
  })
});
