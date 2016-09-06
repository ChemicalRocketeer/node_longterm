const EventEmitter = require('events');
const MemoryQueue = require('./MemoryQueue');

var queue;
var timer;
var longterm = module.exports = new EventEmitter();

longterm.init = function init(options) {
  initializeOptions(options);
  return longterm;
}

longterm.schedule = function schedule(what, when, data, callback) {
  if (!callback && typeof data === 'function') {
    callback = data;
    data = null;
  }
  if (!queue) queue = new MemoryQueue();
  process.nextTick(function() {
    if (!longterm.listeners(what) || !longterm.listeners(what).length) {
      if (callback) callback(new Error('event ' + what + ' has no handlers. Make sure you define event handlers!'));
      return;
    }
    queue.enqueue(when, {what: what, data: data}, function(err, event) {
      if (err) {
        if (callback) callback(err);
        return;
      }
      if (isSoonerThanTimer(event)) {
        setTimer(event);
      }
      if (callback) callback(null, event.id);
    });
  })
  return longterm;
}

longterm.cancel = function cancel(eventId, callback) {
  if (!queue) {
    process.nextTick(callback);
  } else {
    queue.remove(eventId.toString(), function(err, count) {
      if (err) {
        if (callback) process.nextTick(callback, err);
        return;
      }
      if (timer && timer.event.id == eventId) findNextEvent();
      if (callback) process.nextTick(callback);
    });
  }
  return longterm;
}

longterm.clear = function clear(callback) {
  if (!queue) {
    process.nextTick(callback);
  } else {
    queue.clear(function(err, count) {
      if (callback) process.nextTick(callback, err, count);
    })
  }
  return longterm;
}

// trigger the event and look for the next one
function onTimerDone(event) {
  timer = null;
  longterm.emit(event.data.what, event.data.data);
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
