# longterm.js
Longterm is a zero-dependency tool to schedule events persistently across multiple app restarts.
It is designed to handle a large volume of events and to allow great flexibility in its use.

## The API
Define your event listeners on app startup, and then you can schedule events whenever you want.

### init(`options`)
Before scheduling events, you will want to set up longterm with the init function.
This will let you choose the data store you want to use, among other options.

```js
var longterm = require('longterm')
longterm.init({
  queue: new MongoQueue()
})
```

### schedule(`what`, `when`, `data`[, `callback`])
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
Longterm is an EventEmitter. To handle events, use `on(event, handler)`.
When the event handler is called, longterm will pass to it the data that was originally provided when the event was scheduled.

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

For more examples in an actual app environment, check out the demo directory.

## Getting a Queue
Longterm needs to be connected to a queue to work correctly.
The default queue is stored in-memory, which doesn't actually work for persisting across app restarts,
so you'll need a queue backed by a more persistent data store.
You can plug in an existing implementation, or roll your own.
Set the `queue` option in `longterm.init` to use it.

### Existing Queue Implementations
- MongoDB: [longterm_mongo_queue](https://www.npmjs.com/package/longterm_mongo_queue)

### Implementing your own Queue
To implement a queue, you'll need to export a constructor with a few methods.
All the methods in this interface use callbacks but they aren't listed in the definitions; you're smart enough to figure out where they go.
To test your queue (with mocha), use [longterm-queue-test](https://www.npmjs.com/package/longterm-queue-test).
All irrecoverable errors should be bubbled up to the callback.

Any time the queue sends event objects to the callback, they should be of the form
```js
{
  id: "string", // an id provided by the queue implementation
  when: Date, // the scheduled time
  data: { /* the data */ } // the event's data
}
```

If you wrote a queue and you want it mentioned on this readme, please submit a pull request.

#### peek()
Fetches the soonest event (Earliest possible date) and supplies it to the callback. Sends `null` if there are no events queued.

#### enqueue(`when`, `data`)
Stores an event at time `when` (`when` is a Date object), containing `data`, and assigns it a unique string ID (You can store it as whatever you want internally, but front-facing it should be a string). Callback is sent either the full event object as specified above, or just the event id.

#### update(`id`, `data`)
Changes the data of the event with the given `id`. `data` will replace the event's previous data value. Sends the full event (with the updated `data`) to the callback. If the event does not exist in the queue, callback is invoked with `null`.

#### remove(`id`)
Removes the event with the given `id` entirely. Sends the number of events removed to the callback (should be 1), 0 if the event didn't exist.

#### find(`id`)
Sends the full event object with the given `id` to the callback. Makes no changes to the event. Sends `null` if the event is not found.

#### count()
Sends the total number of events in the queue to the callback.

#### clear()
Removes all events from the queue, and sends the total number removed to the callback.

For a more detailed look at what's required from a queue, check out the [tests](https://github.com/ChemicalRocketeer/longterm_queue_test/blob/master/tests.js).
