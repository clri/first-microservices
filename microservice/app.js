var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var logging = require('./lib/logging');

var indexRouter = require('./routes/index');
var customersRouter = require('./routes/customers');
var wline_manager = require('./wline_manager');

function setOntology(ontology) {
  w_manager.ontology = ontology;
}

w_manager = new wline_manager.singleton_manager();
w_manager.initialize(setOntology);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.get('/customers/:id', function(req, resp, next) {
  customersRouter.get_by_id(req, resp, next, w_manager);
});
app.get('/customers', customersRouter.get_by_query);
app.post('/customers', customersRouter.post);
app.post('/register', function(req, resp, next) {
  customersRouter.register(req, resp, next, w_manager);
});
app.post('/login', function(req, resp, next) {
  customersRouter.login(req, resp, next, w_manager);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
