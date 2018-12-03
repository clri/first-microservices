let express = require('express');
let logging = require('../lib/logging');
let return_codes = require('../resources/return_codes');
let pbo = require('../resources/product/productbo');
let login_registration = require('../resources/customers/login_register_bo');
let _passreset = require('../resources/passreset/passreset');
let mail = require('../mail');
let crypto = require('crypto');
let sandh = require('../lib/salthash');
let email_activation = require('../resources/activation/activation');
let env = require('../env');

let invokeU = env.getApig();

var params = {};
var body = {};
var adpar = {};

var apigClientFactory = require('aws-api-gateway-client').default;

var apigClient = apigClientFactory.newClient({
        invokeUrl: invokeU
});


let moduleName = "product.";

let get_admin_operation = function(user) {
        var additionalParams = {
                queryParams: {
                        uid: user
                }
        };

        apigClient.invokeApi(params, '/userPrivilege', 'GET', body, additionalParams)
        .then(function(result){
                res = result['data']['admin'][0];
                logging.debug_message(res);
                return res;
        }).catch( function(err){
                logging.debug_message(err);
                return 0;
        });
}


//let get_by_id = function(req, res, next, w_manager) {
let get_by_id = function(req, res, next) {

    let functionName = "get_by_id:"

    logging.debug_message(moduleName + functionName + "tenant  = ", req.tenant);
    logging.debug_message(moduleName + functionName + "params  = ", req.params);
    //logging.debug_message(req.query);
    var admop = 0;// get_admin_operation(req.query['user']);

    // Extract the tenant from the HTTP header.
    let context = {tenant: req.tenant, adminOperation: admop};
    let fields = null;

    try {

        fields = ['*']
        //pbo.retrieveById(req.params.id, fields, context, w_manager).then(
        pbo.retrieveById(parseInt(req.params.id), fields, context).then(
            function(result) {
                if (result) {
                    res.status(200).json(result);
                }
                else {
                    res.status(404).send("Not found!")
                }
            },
            function(error) {
                logging.debug_message("product.get: error = " + error);
                if (error.code && error.code == return_codes.codes.invalid_query.code) {
                    res.status(400).send("You are a teapot.")
                }
                else {
                    res.status(500).send("Internal error.");
                }
            }
        );
    }
    catch( e) {
      logging.error_message("e = " + e);
      res.status(500).send("Boom23!");
    }

};

let get_all = function(req, res, next) {

    let functionName = "get_all:"

    logging.debug_message(moduleName + functionName + "tenant  = ", req.tenant);
    logging.debug_message(moduleName + functionName + "params  = ", req.params);


    apigClient.invokeApi(params, '/getallProducts', 'GET', body, {})
    .then(function(result){
            logging.debug_message(result['data']);
            res.status(200).json(result['data']);
    }).catch( function(err){
            logging.debug_message(err);
            res.status(404).send("Not found!")
    });
};

let get_by_category =  function(req, res, next) {

    let functionName = "get_by_cat:"

    logging.debug_message("tenant  = ", req.tenant);
    logging.debug_message("params  = ", req.params);
    logging.debug_message(req.params.category);

    logging.debug_message(moduleName + functionName + "tenant  = ", req.tenant);
    logging.debug_message(moduleName + functionName + "params  = ", req.params);
    //logging.debug_message(req.query);
    var admop = 0;// get_admin_operation(req.query['user']);

    // Extract the tenant from the HTTP header.
    let context = {tenant: req.tenant, adminOperation: admop};
    let fields = null;

    try {

        fields = ['*']

        logging.debug_message("ABC")
        pbo.retrieveByCategory(req.params.category, fields, context).then(
            function(result) {
                if (result) {
                        logging.debug_message("ABdC")
                    res.status(200).json(result);
                }
                else {
                        logging.debug_message("AeBC")
                    res.status(404).send("Not found!")
                }
            },
            function(error) {
                logging.debug_message("product.getbyCat: error = " + error);
                if (error.code && error.code == return_codes.codes.invalid_query.code) {
                    res.status(400).send("You are a teapot.")
                }
                else {
                    res.status(500).send("Internal error.");
                }
            }
        );
    }
    catch( e) {
      logging.error_message("e = " + e);
      res.status(500).send("Boom323!");
    }
};

let get_by_query =  function(req, res, next) {

    logging.debug_message("tenant  = ", req.tenant);
    logging.debug_message("params  = ", req.params);
    logging.debug_message("query  = ", req.query);

    var admop = 0;// get_admin_operation(req.query['user']);
    let context = {tenant: req.tenant, adminOperation: admop};

    let fields = [];
    try {
        if (req.query && req.query.fields) {
            fields = req.query.fields.split(',');
            delete req.query.fields;
        }
        else {
            fields = ['*']
        }
        ;
        logging.debug_message('product.get: query = ', req.query);

        pbo.retrieveByTemplate(req.query, fields, context).then(
            function (result) {
                if (result) {
                    res.status(200).json(result);
                }
                else {
                    res.status(404).send("Not found!")
                }
            },
            function (error) {
                console.log(error);
            }
        );
    }
    catch (e) {
        logging.error_message("e = " + e);
        res.status(500).send("Boom33!");
    }
};

exports.get_by_id = get_by_id;
exports.get_by_query = get_by_query;
exports.get_by_category = get_by_category;
exports.getAll = get_all;
