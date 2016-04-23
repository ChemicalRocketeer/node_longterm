function MemoryQueue(options) {
  this._events = [];
  this._eventMap = {};
  this._currentId = 0;
}

MemoryQueue.prototype.dequeue = function(callback) {
  var evt = this._events[0];
  this._events.splice(0, 1);
  this._eventMap[evt.id] = undefined;
  callback(null, evt);
};

MemoryQueue.prototype.peek = function(callback) {
  callback(null, this._events[0]);
};

MemoryQueue.prototype.enqueue = function(what, when, data, callback) {
  data = {
    id: this._currentId++,
    what: what,
    when: when,
    data: data
  };
  // TODO: use a more efficient data structure/algorithm for this operation
  this._events.push(data);
  this._events.sort(function(a, b) {
    if (a.when < b.when) return -1;
    if (a.when > b.when) return 1;
    return 0;
  });
  this._eventMap[data.id] = indexOfEvent(data.id, this._events);
  callback(null, data);
};

MemoryQueue.prototype.remove = function(id, callback) {
  var index = this._eventMap[id];
  if (typeof index === 'undefined') {
    return callback(null, 0);
  }
  this._events.splice(index, 1);
  this._eventMap[id] = undefined;
  callback(null, 1);
};

MemoryQueue.prototype.find = function(id, callback) {
  var index = this._eventMap[id];
  if (typeof index === 'undefined') {
    return callback(null, null);
  }
  callback(this._events[index]);
};

MemoryQueue.prototype.count = function(callback) {
  callback(null, this._events.length);
};

MemoryQueue.prototype.clear = function(callback) {
  var count = this._events.length;
  this._events = [];
  this._eventMap = {};
  callback(null, count);
};

function indexOfEvent(eventId, arr) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].id === eventId) return i;
  }
  return -1;
}

module.exports = MemoryQueue;
