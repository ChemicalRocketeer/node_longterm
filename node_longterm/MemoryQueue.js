function MemoryQueue(options) {
  this._events = [];
  this._currentId = 0;
}

var proto = MemoryQueue.prototype;

proto.next = function(callback) {
  if (this._events.length > 0) {
    callback(null, this._events[0]);
  } else {
    callback(null, null);
  }
};

proto.enqueue = function(what, when, data, callback) {
  data = {
    id: this._currentId++,
    what: what,
    when: when,
    data: data
  };
  // TODO: use a more efficient data structure/algorithm for this operation
  this._events.push(data);
  this._events.sort(function(a, b) {
    return a.when - b.when;
  });
  callback(null, data);
};

proto.remove = function(id, callback) {
  var index = this._find(id);
  if (index === -1) {
    return callback(null, 0);
  } else {
    this._events.splice(index, 1);
    callback(null, 1);
  }
};

proto.find = function(id, callback) {
  var index = this._find(id);
  if (index === -1) {
    return callback(null, null);
  }
  callback(null, this._events[index]);
};

proto.count = function(callback) {
  callback(null, this._events.length);
};

proto.clear = function(callback) {
  var count = this._events.length;
  this._events = [];
  callback(null, count);
};

proto._find = function(id) {
  for (var i = 0; i < this._events.length; i++) {
    if (this._events[i].id === id) return i;
  }
  return -1;
};

module.exports = MemoryQueue;
