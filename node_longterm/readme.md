# longterm.js
This package is still in development! There is not adequate testing, and some features have not been built yet!

Longterm is a tool to schedule arbitrary events dynamically and persistently across multiple instances and restarts. It is designed to handle a large volume of events and to allow great flexibility in its use.

## The API
Define your event types and response functions on app startup, and then you can schedule events whenever you want.

### longterm
The primary export of longterm.js is the longterm function, which allows you to schedule events.

#### signature
`longterm(what, when, data[, callback])`

#### example
```
var longterm = require('longterm');
longterm('party', Date.now() + 10000, {
  inviteList: [
    'Aaron',
    'Aji',
    'Jake',
    'Kyle'
  ]
});
```

### init
Before scheduling events, you will want to set up longterm with the init function. This will let you choose the type of data store you want to use, among other options.

```
longterm.init({
  queue: queueType,
  on: { eventName: function, otherEvent: function, ... },
  error: function|[function]
})
```
(all options are, as the name implies, optional)


### middleware
The init function doesn't just set up your options. It also returns middleware which can be used with Express.
```
var app = require('express')();
var longterm = require('longterm');
app.use(longterm.init());
```

### For more examples in an actual app environment, check out the demo directory.
