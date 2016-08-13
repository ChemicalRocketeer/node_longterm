var chai = require('chai');
var expect = chai.expect;
var async = require('async');
var MemoryQueue = require('../MemoryQueue');

describe('MemoryQueue', function() {

  var queue;

  var asyncEnq = function(when, data) {
    return function(callback) {
      queue.enqueue(when, data, callback);
    }
  }

  describe('enqueue', function() {
    beforeEach(function() {
      queue = new MemoryQueue();
    });

    it('should return the event information', function(done) {
      var now = Date.now();
      queue.enqueue(now, {data: 'x'}, function(err, item) {
        expect(item).to.exist;
        expect(item).to.have.all.keys('id', 'when', 'data');
        expect(item.data).to.deep.equal({data: 'x'});
        done();
      });
    })
  })

  describe('peek', function() {
    beforeEach(function() {
      queue = new MemoryQueue();
    });

    var asyncPeek = function(expected, remove) {
      return function(callback) {
        queue.peek(function(err, item) {
          expect(item).to.exist;
          expect(item).to.have.all.keys('id', 'when', 'data');
          expect(item.data).to.deep.equal(expected);
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

    it('should find an event if there is one', function(done) {
      var now = Date.now();
      queue.enqueue(now, {data: 'dat'}, function(err, item) {
        queue.peek(function(err, item) {
          expect(item).to.exist;
          expect(item).to.have.all.keys('id', 'when', 'data');
          expect(item.data).to.deep.equal({data: 'dat'});
          done();
        })
      });
    });

    it('should return null if there are no events', function(done) {
      queue.peek(function(err, item) {
        expect(item).to.be.null;
        done();
      });
    });

    it('should retrieve events in temporal order despite insertion order', function(done) {
      var now = Date.now();
      async.series([
        asyncEnq(now + 4000, {data: 3}),
        asyncEnq(now + 2000, {data: 2}),
        asyncEnq(now + 10000, {data: 4}),
        asyncEnq(now, {data: 1}),
        asyncPeek({data: 1}, true),
        asyncPeek({data: 2}, true),
        asyncPeek({data: 3}, true),
        asyncPeek({data: 4}, true)
      ], done);
    });
  });

  describe('update', function() {
    beforeEach(function() {
      queue = new MemoryQueue();
    });

    it('should change the event persistently', function(done) {
      queue.enqueue(Date.now(), {data: 'foo'}, function(err, item) {
        queue.update(item.id, {change: 'bar'}, function(err, item) {
          queue.find(item.id, function(err, item) {
            expect(item).to.exist;
            expect(item).to.have.all.keys('id', 'when', 'data');
            expect(item.data).to.deep.equal({change: 'bar'});
            done();
          });
        });
      });
    });

    it('should return the modified event', function(done) {
      queue.enqueue(Date.now(), {data: 'foo'}, function(err, item) {
        queue.update(item.id, {change: 'bar'}, function(err, item) {
          expect(item).to.exist;
          expect(item).to.have.all.keys('id', 'when', 'data');
          expect(item.data).to.deep.equal({change: 'bar'});
          done();
        });
      });
    });

    it('should return null if the event does not exist', function(done) {
      queue.update('nope', {data: 'oh the huge manatee'}, function(err, item) {
        expect(item).to.be.null;
        done();
      });
    });
  });

  describe('remove', function() {
    beforeEach(function() {
      queue = new MemoryQueue();
    });

    it('should remove the correct item', function(done){
      var now = Date.now();
      async.series([
        asyncEnq(now, {a: 'a'}),
        asyncEnq(now + 100, {b: 'b'}),
        asyncEnq(now + 1000, {c: 'c'}),
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

    it('should do nothing if the item does not exist', function(done){
      var now = Date.now();
      async.series([
        asyncEnq(now, {a: 'a'}),
        asyncEnq(now + 100, {b: 'b'}),
        asyncEnq(now + 1000, {c: 'c'}),
      ], function(err, results) {
        queue.remove(-474395657, function(err, count) {
          expect(count).to.equal(0);
          async.each(results, function(result, callback) {
            queue.find(result.id, function(err, item) {
              expect(item).to.exist;
              callback();
            });
          }, done);
        });
      });
    });

    it('should do nothing if there are no items', function(done){
      queue.remove(0, function(err, count) {
        expect(count).to.equal(0);
        done();
      });
    });
  });

  describe('find', function() {
    beforeEach(function() {
      queue = new MemoryQueue();
    });

    it('should find the correct item', function(done){
      var now = Date.now();
      async.series([
        asyncEnq(now, {a: 'a'}),
        asyncEnq(now + 100, {b: 'b'}),
        asyncEnq(now + 1000, {c: 'c'}),
      ], function(err, results) {
        queue.find(results[1].id, function(err, item) {
          expect(item).to.exist;
          expect(item).to.have.all.keys('id', 'when', 'data');
          expect(item.data).to.deep.equal({b: 'b'});
          done();
        });
      });
    });

    it('should send null if the item does not exist', function(done){
      queue.enqueue(Date.now(), {data: 'dat'}, function(err, item) {
        queue.find(-893623618, function(err, item) {
          expect(item).to.be.null;
          done();
        });
      });
    });

    it('should send null if there are no items', function(done){
      queue.find(-893623618, function(err, item) {
        expect(item).to.be.null;
        done();
      });
    });
  });

  describe('count', function() {
    beforeEach(function() {
      queue = new MemoryQueue();
    });

    it('should return the correct number', function(done) {
      var now = Date.now();
      async.series([
        asyncEnq(now, {a: 'a'}),
        asyncEnq(now + 100, {b: 'b'}),
        asyncEnq(now + 1000, {c: 'c'}),
      ], function(err, results) {
        queue.count(function(err, count) {
          expect(count).to.equal(3);
          done();
        });
      });
    });

    it('should return 0 on an empty queue', function(done) {
      queue.count(function(err, count) {
        expect(count).to.equal(0);
        done();
      });
    });
  });

  describe('clear', function() {
    beforeEach(function() {
      queue = new MemoryQueue();
    });

    it('should clear the queue', function(done) {
      var now = Date.now();
      async.series([
        asyncEnq(now, {a: 'a'}),
        asyncEnq(now + 100, {b: 'b'}),
        asyncEnq(now + 1000, {c: 'c'}),
      ], function(err, results) {
        queue.clear(function(err, count) {
          expect(count).to.equal(3);
          queue.peek(function(err, item) {
            expect(item).to.not.exist;
            queue.count(function(err, count) {
              expect(count).to.equal(0);
              done();
            })
          });
        });
      });
    });

    it('should do nothing with an empty queue', function(done) {
      queue.clear(function(err, count) {
        expect(count).to.equal(0);
        queue.peek(function(err, item) {
          expect(item).to.not.exist;
          queue.count(function(err, count) {
            expect(count).to.equal(0);
            done();
          })
        });
      });
    });
  });
});
