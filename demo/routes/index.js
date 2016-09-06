var express = require('express');
var router = express.Router();
var longterm = require('../../longterm');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/longterm', function(req, res, next) {
  longterm.schedule('test', Date.now() + 5000, { message: 'hello longterm!' }, function(err, eventId) {
    res.send('scheduled event #' + eventId + ' for 5 seconds from now');
  });
});

module.exports = router;
