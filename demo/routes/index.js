var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/longterm', function(req, res, next) {
  res.longterm.schedule('test', Date.now() + 5000, { message: 'hello longterm!' }, function(err, eventId) {
    res.send(eventId.toString());
  });
});

module.exports = router;
