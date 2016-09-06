# longterm.js
This package is still in development! There is not adequate testing, and some features have not been built yet!

Longterm is a tool to schedule arbitrary events dynamically and persistently across multiple instances and restarts. It is designed to handle a large volume of events and to allow great flexibility in its use.

## The API
Define your event types and response functions on app startup, and then you can schedule events whenever you want.

### init
Before scheduling events, you will want to set up longterm with the init function. This will let you choose the data store you want to use, among other options.

```
longterm.init({
  queue: new MongoQueue()
})
```

### schedule
The primary export of longterm.js is the longterm function, which allows you to schedule events.

`longterm.schedule(what, when, data[, callback])`

```
var longterm = require('longterm');

longterm.schedule('party', Date.now() + 10000, {
  inviteList: [
    'Aaron',
    'Christy',
    'Aji',
    'Nancy'
  ]
});
```

### event binding
To handle events, use longterm's `on` function.

```
longterm.on('party', function(data) {
  for (guest in data.inviteList) {
    console.log('Welcome to the party, ' + guest + '!');
  }
})
```

You may want to set up an error handler. If you don't specify one, errors will be printed to `console.error`.

```
longterm.on('error', function(err) {
  handle(err);
})
```

### For more examples in an actual app environment, check out the demo directory.
