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
var ordersRouter = require('./routes/orders');
var productRouter = require('./routes/product');
var categoryRouter = require('./routes/category');
var _passreset = require('./resources/passreset/passreset');
var email_activation = require('./resources/activation/activation');
//var wline_manager = require('./wline_manager');
var rc = require('./rclient.js');

/*function setOntology(ontology) {
  w_manager.ontology = ontology;
  console.log(w_manager.ontology)
}

w_manager = new wline_manager.singleton_manager();
w_manager.initialize(setOntology);*/
var rclient0 = rc.init0();
var rclient1 = rc.init1();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//@TODO: get favicon
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// /*for middleware and multitenancy*/
//DO NOT COMMENT THIS OUT!!!!!
app.use('/', function(req, res, next) {
     logging.debug_message("headers = ", req.headers);
     let dnsFields = req.headers['host'].split('.');
     //req.tenant = dnsFields[0];
     req.tenant = 'E6156';
     next();
 });

 app.get('/api/orders/:id', function(req, resp, next) {
         ordersRouter.get_by_id(req, resp, next);
 });

 app.get('/api/orders/:id/:oid', function(req, resp, next) {
         ordersRouter.get_by_oid(req, resp, next);
 });

app.use('/', indexRouter);
app.get('/api/customers/:id', function(req, resp, next) {
  //customersRouter.get_by_id(req, resp, next, w_manager);
  customersRouter.get_by_id(req, resp, next);
});
app.get('/api/customers', customersRouter.get_by_query);
app.post('/api/customers', customersRouter.post);

app.get('/api/products/:id', function(req, resp, next) {
  productRouter.get_by_id(req, resp, next);
});

app.get('/api/getcats', function(req, resp, next) {
  categoryRouter.get_cats(req, resp, next);
});


app.get('/api/wholecatalog', productRouter.getAll);
app.get('/api/shop/:category', function(req, resp, next) {
  //customersRouter.get_by_id(req, resp, next, w_manager);
  productRouter.get_by_category(req, resp, next);
});
app.post('/api/register', function(req, resp, next) {
  //customersRouter.register(req, resp, next, w_manager, rclient1);
  customersRouter.register(req, resp, next, rclient1);
});
app.post('/api/login', function(req, resp, next) {
  //customersRouter.login(req, resp, next, w_manager);
  customersRouter.login(req, resp, next);
});

app.post('/api/tokenlogin', function(req, resp, next) {
  customersRouter.tokenLogin(req, resp, next);
});

app.post('/api/passresetreq', function(req, resp, next) {
  //customersRouter.passresetreq(req, resp, next, w_manager, rclient0);
  customersRouter.passresetreq(req, resp, next, rclient0);
});

app.get('/api/forgotpassword/:reset_token', function(req, resp, next) {
  _passreset.validateResetToken(rclient0, req.params.reset_token).then(
    function(success) {
      if(success == true) {
        resp.cookie("reset_token", req.params.reset_token).sendFile("forgotpassword.html", {root: "public/"});
      }
      else {
        resp.status(403).json("Forbidden: Invalid reset token.");
      }
    },
    function(error) {
      resp.status(500).json("/forgotpassword/:reset_token error: ", error);
    }
  ).catch(function(exc) {
    resp.status(500).json("/forgotpassword/:reset_token exception: ", exc);
  });
});

app.get('/api/activateEmail/:activation_token', function(req, resp, next) {
  console.log("Activation token: ", req.params.activation_token);
  email_activation.validateActivationToken(rclient1, req.params.activation_token).then(
    function(success) {
      if(success == true) {
        //customersRouter.activate_account(req, resp, next, w_manager, rclient1).then(
        customersRouter.activate_account(req, resp, next, rclient1).then(
          function(success) {
            resp.status(200).json(success);
          },
          function(error) {
            resp.status(500).json(error);
          }
        ).catch(function(exc){
          resp.status(500).json(exc);
        });
      }
      else {
        resp.status(403).json("Forbidden: Invalid Activation Token");
      }
    },
    function(error) {
      resp.status(500).json("/activateEmail/:activation_token error: " + error);
    }
  ).catch(function(exc) {
    resp.status(500).json("/activateEmail/:activation_token exception: " + exc);
  });
});

app.post('/api/passreset', function(req, resp, next) {
  //customersRouter.passreset(req, resp, next, w_manager, rclient0);
  customersRouter.passreset(req, resp, next, rclient0);
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
