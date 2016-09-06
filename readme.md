# longterm.js

Longterm is a zero-dependency tool to schedule events persistently across multiple app restarts. It is designed to handle a large volume of events and to allow great flexibility in its use.

## The API
Define your event types and response functions on app startup, and then you can schedule events whenever you want.

### `init(options)`
Before scheduling events, you will want to set up longterm with the init function. This will let you choose the data store you want to use, among other options.

```js
var longterm = require('longterm')
longterm.init({
  queue: new MongoQueue()
})
```

### `schedule(what, when, data[, callback])`
The primary export of longterm.js is the longterm function, which allows you to schedule events.

```js
longterm.schedule('party', Date.now() + 10000, {
  inviteList: [
    'Aaron',
    'Christy',
    'Aji',
    'Nancy'
  ]
});
```

### Event Binding
Longterm is an EventEmitter. To handle events, use `on(event, handler)`. The event handler will be passed as a parameter the data that was originally provided when the event was scheduled.

```js
longterm.on('party', function(data) {
  for (guest in data.inviteList) {
    console.log('Welcome to the party, ' + guest + '!');
  }
})
```

You may want to set up an error handler. If you don't specify one, errors will be printed to `console.error`.

```js
longterm.on('error', function(err) {
  handle(err);
})
```

### For more examples in an actual app environment, check out the demo directory.
