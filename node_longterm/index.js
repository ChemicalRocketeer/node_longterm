var queue;
var timer;
var listenerMap = {};
var errorHandlers = [];

function init(options) {
  initializeOptions(options);
  return middleware;
}

function on(what, funk) {
  if (typeof what === 'string' && typeof funk === 'function') {
    listenerMap[what] = listenerMap[what] || [];
    listenerMap[what].push(funk);
  }
  // allow chaining:   require('longterm').on(what, funk).on(what, funk)
  return middleware;
}

function error(funk) {
  if (typeof funk === 'function') errorHandlers.push(funk);
  return middleware;
}

function middleware(req, res, next) {
  res.longterm = longterm;
  next();
}

function longterm(what, when, data, callback) {
  if (!queue) queue = new MemoryQueue();
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
  return longterm;
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
  queue.remove(event.id, function(err, removed) {
    if (err) return fireError(err);
    queue.next(function(err, next) {
      if (err) return fireError(err); //TODO: add user error handling
      if (next) {
        setTimer(next);
      }
    });
  });
}

function fireError(err) {
  for (var i = 0; i < errorHandlers.length; i++) {
    process.nextTick(errorHandlers[i], err);
  }
}

function initializeOptions(options) {
  if (typeof options !== 'object' || options === null) options = {};
  if (!options.queue) {
    // TODO: warn about MemoryQueue if env is set to prod
    var MemoryQueue = require('./MemoryQueue');
    queue = options.queue = new MemoryQueue();
  }
  // find all the functions in the 'on' variable, and apply them with the 'on' function
  if (options.on) {
    for (var what in options.on) {
      if (options.on.hasOwnProperty(what)) {
        on(what, options.on[what]);
      }
    }
  }
  if (Array.isArray(options.error)) {
    for (var i = 0; i < options.error.length; i++) {
      var handler = options.error[i];
      if (typeof handler === 'function') {
        error(handler);
      }
    }
  } else if (typeof options.error === 'function') {
    error(options.error);
  }
  return options;
}

// set up the variables for ease of use in the api
// allow chaining:   require('longterm').on(what, funk).error(funk)
longterm.on = middleware.on = on;
longterm.error = middleware.error = error;
longterm.init = init;

module.exports = longterm;
