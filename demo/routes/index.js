var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/longterm', function(req, res, next) {
  console.log('longterm');
  res.longterm();
});

module.exports = router;
