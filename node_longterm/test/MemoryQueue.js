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

  var asyncNext = function(expected, remove) {
    return function(callback) {
      queue.next(function(err, item) {
        expect(item).to.exist;
        expect(item).to.have.all.keys('id', 'what', 'when', 'data');
        expect(item.what).to.equal(expected);
        if (item && remove) {
          queue.remove(item.id, function() {
            process.nextTick(callback);
          })
        } else {
          process.nextTick(callback);
        }
      });
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
        expect(item).to.exist;
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

    it('should find an event if there is one', function(done) {
      var now = Date.now();
      queue.enqueue('a', now, {data: 'dat'}, function(err, item) {
        queue.next(function(err, item) {
          expect(item).to.exist;
          expect(item).to.have.all.keys('id', 'what', 'when', 'data');
          expect(item).to.contain.all.keys({what: 'name', when: now, data: {data: 'x'}});
          done();
        })
      });
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
        asyncNext('a', true),
        asyncNext('b', true),
        asyncNext('c', true),
        asyncNext('d', true)
      ], done);
    });
  });

  describe('remove', function() {
    beforeEach(function(done) {
      queue = new MemoryQueue();
      done();
    });

    it('should remove the correct item', function(done){
      var now = Date.now();
      async.series([
        asyncEnq('a', now, {a: 'a'}),
        asyncEnq('b', now + 100, {b: 'b'}),
        asyncEnq('c', now + 1000, {c: 'c'}),
      ], function(err, results) {
        queue.remove(results[1].id, function(err, count) {
          expect(count).to.equal(1);
          queue.find(results[1].id, function(err, item) {
            expect(item).not.to.exist;
            done();
          });
        });
      });
    });
  })
});
