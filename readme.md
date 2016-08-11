# longterm.js
This package is still in development! There is not adequate testing, and some features have not been built yet!

Longterm is a tool to schedule arbitrary events dynamically and persistently across multiple instances and restarts. It is designed to handle a large volume of events and to allow great flexibility in its use.

## The API
Define your event types and response functions on app startup, and then you can schedule events whenever you want.

### longterm
The primary export of longterm.js is the longterm function, which allows you to schedule events.

`longterm(what, when, data[, callback])`

```
var longterm = require('longterm');

longterm('party', Date.now() + 10000, {
  inviteList: [
    'Aaron',
    'Christy',
    'Aji',
    'Nancy'
  ]
});
```

### init
Before scheduling events, you will want to set up longterm with the init function. This will let you choose the data store you want to use, among other options.

```
longterm.init({
  queue: new MongoQueue()
})
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


### middleware
The init function doesn't just set up your options. It also returns middleware which can be used with Express. The middleware is attached to
```
var app = require('express')();
var longterm = require('longterm');

var middleware = longterm.init();
app.use(middleware);

app.use('/', function(req, res) {
  res.longterm('party', Date.now(), {
    ['Just Me']
  });
});
```

### For more examples in an actual app environment, check out the demo directory.
