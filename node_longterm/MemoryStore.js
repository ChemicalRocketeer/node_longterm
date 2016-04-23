function MemoryStore(options) {
  this._events = [];
  this._currentId = 0;
}

MemoryStore.prototype.getNext = function(callback) {
  callback(null, this._events[0]);
};

MemoryStore.prototype.set = function(time, type, data, callback) {
  data = {
    id: this._currentId++,
    type: type,
    time: time,
    data: data
  };
  // TODO: use BST for event storage so that this is more efficient
  this._events.push(data);
  this._events.sort(function(a, b) {
    if (a.time < b.time) return -1;
    if (a.time > b.time) return 1;
    return 0;
  });
  callback(null, data.id);
};

MemoryStore.prototype.get = function(id, callback) {
  for (var i = 0; i < this._events.length; i++) {
    var evt = this._events[i];
    if (evt.id === id) return callback(null, evt);
  }
  callback('node_longerm/MemoryStore: No event with the given id exists.');
};

MemoryStore.prototype.destroy = function(id, callback) {
  this._events = [];
  callback(null);
};

MemoryStore.prototype.all = function(callback) {
  callback(null, this._events);
};

MemoryStore.prototype.length = function(callback) {
  callback(null, this._events.length);
};

MemoryStore.prototype.clear = function(callback) {
  this._events = {};
  callback(null);
};

module.exports = MemoryStore;
