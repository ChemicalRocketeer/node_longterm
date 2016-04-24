var queue;
var timer;
var listenerMap = {};

function schedule(what, when, data, callback) {
  queue.enqueue(what, when, data, function(err, event) {
    if (err) {
      if (typeof callback === 'function') callback(err);
      return;
    }
    if (!timer || event.when <= Date.now()) {
      setTimer(event);
    }
    if (typeof callback === 'function') callback(null, event.id);
  });
}

// sets the timer to wait for the given event
function setTimer(event) {
  if (timer) {
    clearTimeout(timer.timeoutObj);
  }
  var delay = Date.now() - new Date(event.when);
  timer = {
    timeoutObj: setTimeout(onTimerDone, delay, event),
    event: event
  };
}

// trigger the event and look for the next one
function onTimerDone(event) {
  timer = null;
  if (event) {
    var listeners = listenerMap[event.what];
    if (listeners) {
      for (var i = 0; i < listeners.length; i++) {
        process.nextTick(listeners[i], event.data);
      }
    }
  }
  queue.remove(event.id, function(err) {
    if (err) console.error(err);
    queue.next(function(err, next) {
      if (err) console.error(err); //TODO: add user error handling
      if (next) {
        setTimer(next);
      }
    });
  });
}

function on(what, funk) {
  if (typeof what === 'string' && typeof funk === 'function') {
    listenerMap[what] = listenerMap[what] || [];
    listenerMap[what].push(funk);
  }
  // allow chaining:   require('longterm').on(what, funk).on(what, funk)
  return middleware;
}

function initializeOptions(options) {
  if (typeof options !== 'object' || options === null) options = {};
  if (!options.queue) {
    // TODO: warn about MemoryQueue if env is set to prod
    var MemoryQueue = require('./MemoryQueue');
    queue = options.queue = new MemoryQueue();
  }
  if (options.on) {
    for (var what in options.on) {
      if (options.on.hasOwnProperty(what)) {
        on(what, options.on[what]);
      }
    }
  }
  return options;
}

function middleware(req, res, next) {
  res.longterm = {
    schedule: schedule
  };
  next();
}

function init(options) {
  initializeOptions(options);
  return middleware;
}

// allow chaining:   require('longterm').on(what, funk)
init.on = middleware.on = on;

module.exports = init;
