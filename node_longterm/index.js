var opts;

function init(options) {
  opts = initializeOptions(options);

  return function(req, res, next) {
    // temporary function to test middleware
    res.longterm = function() {
      res.send('hello longterm!');
    };
    next();
  };
}

function initializeOptions(options) {
  if (typeof options !== 'object' || options === null) options = {};
  if (!options.queue) {
    var MemoryQueue = require('./MemoryQueue');
    options.queue = new MemoryQueue();
  }
  return options;
}

module.exports = init;
