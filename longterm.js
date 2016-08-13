const EventEmitter = require('events');

var queue;
var timer;
var emit;

function init(options) {
  initializeOptions(options);
}

function longterm(what, when, data, callback) {
  if (!queue) queue = new MemoryQueue();
  if (!longterm.listeners(what) || !longterm.listeners(what).length) {
    callback('event ' + what + ' has no handlers. Make sure you define event handlers!');
  }
  queue.enqueue(when, {what: what, data: data}, function(err, event) {
    if (err) {
      if (typeof callback === 'function') callback(err);
      return;
    }
    if (isSoonerThanTimer(event)) {
      setTimer(event);
    }
    if (typeof callback === 'function') callback(null, event.id);
  });
  return longterm;
}

// make the longterm function inherit from EventEmitter
function bindEventEmitter() {
  function extend(child, parent) {
    for (var thing in parent) {
      if (parent.hasOwnProperty(thing)) {
        child[thing] = parent[thing];
      }
    }
  }
  extend(longterm, EventEmitter.prototype)
  EventEmitter.call(longterm);
  // ensure only we can emit the events
  emit = longterm.emit;
  delete longterm.emit;
}

bindEventEmitter();

function cancel(eventId, callback) {
  if (!queue) queue = new MemoryQueue();
  queue.remove(eventId.toString(), function(err, count) {
    if (err) {
      if (typeof callback === 'function') callback(err);
      return;
    }
    if (timer && timer.event.id == eventId) findNextEvent();
    if (typeof callback === 'function') callback();
  });
}

// trigger the event and look for the next one
function onTimerDone(event) {
  timer = null;
  emit.call(longterm, event.data.what, event.data.data);
  queue.remove(event.id, function(err, removed) {
    if (err) return fireError(err);
    findNextEvent();
  });
}

function findNextEvent() {
  queue.peek(function(err, next) {
    if (err) return fireError(err);
    if (next && isSoonerThanTimer(next)) {
      setTimer(next);
    }
  });
}

function isSoonerThanTimer(event) {
  return !timer || event.when < timer.event.when;
}

// sets the timer to wait for the given event
function setTimer(event) {
  if (timer) {
    clearTimeout(timer.timeoutObj);
  }
  var delay = new Date(event.when) - Date.now();
  timer = {
    timeoutObj: setTimeout(onTimerDone, delay, event),
    event: event
  };
}

function initializeOptions(options) {
  if (typeof options !== 'object' || options === null) options = {};

  if (!options.queue) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('longterm.js: MemoryQueue should not be used in a production environment. Use a database queue like MongoQueue instead.');
    }
    var MemoryQueue = require('./MemoryQueue');
    options.queue = new MemoryQueue();
  }
  queue = options.queue;
  // find all the functions in the 'on' variable, and apply them with the 'on' function
  if (options.on) {
    for (var what in options.on) {
      if (options.on.hasOwnProperty(what)) {
        longterm.on(what, options.on[what]);
      }
    }
  }
  findNextEvent();
  return options;
}

longterm.cancel = cancel;
longterm.init = init;

module.exports = longterm;
