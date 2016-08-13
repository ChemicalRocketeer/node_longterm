var assert = require('assert');
var expect = require('chai').expect;
var longterm = require('../longterm');
var async = require('async');

describe('longterm', function() {

  beforeEach(function(done) {
    longterm.clear(function() {
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
});
