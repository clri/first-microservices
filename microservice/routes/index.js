var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
 router.get('/', function(req, res, next) {
   //res.redirect('/');
   res.sendFile("home.html", {root: path.join(__dirname, "../bak_public")});
 });

 router.get('/home', function(req, res, next) {
   res.sendFile("home.html", {root: path.join(__dirname, "../bak_public")});
 });

//@TODO: send params in a cleaner way
 router.get('/profile/:profileID', function(req, res, next) {
   res.sendFile("profile.html", {root: path.join(__dirname, "../bak_public")})
 });

 router.get('/order/:profileID/:orderID', function(req, res, next) {
   res.sendFile("order.html", {root: path.join(__dirname, "../bak_public")})
 });

 router.get('/cart', function(req, res, next) {
   res.sendFile("cart.html", {root: path.join(__dirname, "../bak_public")})
 });

 router.get('/api/checking', function(req, res, next) {
   res.sendFile("checking.html", {root: path.join(__dirname, "../bak_public")})
 });

 router.get('/api/address', function(req, res, next) {
   res.sendFile("address.html", {root: path.join(__dirname, "../bak_public")})
 });

 router.get('/api/payment', function(req, res, next) {
   res.sendFile("payment.html", {root: path.join(__dirname, "../bak_public")})
 });

router.get('/product', function(req, res, next) {
  res.sendFile("product.html", {root: path.join(__dirname, "../bak_public")})
});

 router.get('/catalog', function(req, res, next) {
   res.sendFile("catalog.html", {root: path.join(__dirname, "../bak_public")})
 });
router.get('/catalog/:categoryID', function(req, res, next) {
  res.sendFile("catalog.html", {root: path.join(__dirname, "../bak_public")})
});

 router.get('/categories', function(req, res, next) {
   res.sendFile("categories.html", {root: path.join(__dirname, "../bak_public")})
});

module.exports = router;
