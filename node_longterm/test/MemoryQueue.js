var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var async = require('async');
var MemoryQueue = require('../MemoryQueue');

describe('MemoryQueue', function() {

  var queue;

  var asyncEnq = function(what, when, data) {
    return function(callback) {
      queue.enqueue(what, when, data, callback);
    }
  }

  var asyncWhat = function(expected, remove) {
    return function(callback) {
      queue.next(function(err, item) {
        assert.equal(expected, item.what);
        if (item) {
          queue.remove(item.id, function() {
            process.nextTick(callback);
          })
        } else {
          process.nextTick(callback);
        }
      });
    }
  }

  var asyncRemove = function(id) {
    return function(callback) {
      queue.remove(id);
    }
  }

  describe('enqueue', function() {
    beforeEach(function(done) {
      queue = new MemoryQueue();
      done();
    });

    it('should return the event information', function(done) {
      var now = Date.now();
      queue.enqueue('a', now, {data: 'x'}, function(err, item) {
        expect(item).to.have.all.keys('id', 'what', 'when', 'data');
        expect(item).to.contain.all.keys({what: 'name', when: now, data: {data: 'x'}});
        done();
      });
    })
  })

  describe('next', function() {
    beforeEach(function(done) {
      queue = new MemoryQueue();
      done();
    });

    it('should return an event if there is one', function(done) {
      async.series([
        asyncEnq('a', Date.now(), {data: 'data'}),
        asyncWhat('a')
      ], done);
    });

    it('should return null if there are no events', function(done) {
      queue.next(function(err, item) {
        assert.equal(null, item);
        done();
      });
    });

    it('should retrieve events in temporal order despite insertion order', function(done) {
      var now = Date.now();
      async.series([
        asyncEnq('c', now + 4000, {data: 3}),
        asyncEnq('b', now + 2000, {data: 2}),
        asyncEnq('d', now + 10000, {data: 4}),
        asyncEnq('a', now, {data: 1}),
        asyncWhat('a'),
        asyncWhat('b'),
        asyncWhat('c'),
        asyncWhat('d')
      ], done);
    });
  });
});
