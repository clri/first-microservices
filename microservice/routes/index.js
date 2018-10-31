var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/home');
});

router.get('/home', function(req, res, next) {
  res.sendFile("home.html", {root: path.join(__dirname, "../public")});
});

module.exports = router;
