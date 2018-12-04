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

//@TODO: send params in a cleaner way
router.get('/profile/:profileID', function(req, res, next) {
  res.sendFile("profile.html", {root: path.join(__dirname, "../public")})
});

router.get('/product/:productID', function(req, res, next) {
  res.sendFile("product.html", {root: path.join(__dirname, "../public")})
});

router.get('/catalog', function(req, res, next) {
  res.sendFile("catalog.html", {root: path.join(__dirname, "../public")})
});
router.get('/catalog/:categoryID', function(req, res, next) {
  res.sendFile("catalog.html", {root: path.join(__dirname, "../public")})
});

router.get('/categories', function(req, res, next) {
  res.sendFile("categories.html", {root: path.join(__dirname, "../public")})
});

module.exports = router;
