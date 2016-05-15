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
  if (!listenerMap[what] || !listenerMap[what].length) {
    fireError('event ' + what + ' has no handlers. Make sure you define event handlers!');
  }
  queue.enqueue(when, {what: what, data: data}, function(err, event) {
    if (err) {
      if (typeof callback === 'function') callback(err);
      return;
    }
    if (!timer || event.when <= timer.event.when) {
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
  var listeners = listenerMap[event.data.what];
  if (listeners) {
    for (var i = 0; i < listeners.length; i++) {
      process.nextTick(listeners[i], event.data.data);
    }
  } else {
    fireError('event ' + event.data.what + ' has no handlers. Make sure you define event handlers!');
  }
  queue.remove(event.id, function(err, removed) {
    if (err) return fireError(err);
    queue.peek(function(err, next) {
      if (err) return fireError(err);
      if (next) {
        setTimer(next);
      }
    });
  });
}

function fireError(err) {
  if (errorHandlers.length === 0) {
    process.nextTick(console.error, err);
  }
  for (var i = 0; i < errorHandlers.length; i++) {
    process.nextTick(errorHandlers[i], err);
  }
}

function initializeOptions(options) {
  if (typeof options !== 'object' || options === null) options = {};
  if (!options.queue) {
    if (process.env.NODE_ENV === 'production') {
      console.log('longterm.js: MemoryQueue should not be used in a production environment. Use a database queue like MongoQueue instead.');
    }
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
