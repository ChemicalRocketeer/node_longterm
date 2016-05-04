var assert = require('assert');
var MemoryQueue = require('../MemoryQueue');

describe('MemoryQueue', function() {

  var queue;

  describe('enqueue', function() {
    beforeEach(function(done) {
      queue = new MemoryQueue();
      queue.enqueue('a', Date.now() + 400, {data: '1'}, done);
    });

    it('should get the soonest event on next', function(done) {
      queue.next(function(err, item) {
        assert.equal('a', item.what);
        done();
      });
    });

    afterEach(function() {
      queue = new MemoryQueue();
    });
  });
});
