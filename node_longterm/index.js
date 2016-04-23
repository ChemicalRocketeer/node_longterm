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
  if (!options.store) {
    var MemoryStore = require('./MemoryStore');
    options.store = new MemoryStore();
  }
  return options;
}

module.exports = init;
