let express = require('express');
let logging = require('../lib/logging');
let env = require('../env');

let invokeU = env.getApig();

var params = {};
var body = {};
var adpar = {};

var apigClientFactory = require('aws-api-gateway-client').default;

var apigClient = apigClientFactory.newClient({
        invokeUrl: invokeU
});


let moduleName = "category.";


let get_all = function(req, res, next) {

    let functionName = "get_all:"

    logging.debug_message(moduleName + functionName + "tenant  = ", req.tenant);
    logging.debug_message(moduleName + functionName + "params  = ", req.params);


    apigClient.invokeApi(params, '/getCategories', 'GET', body, adpar)
    .then(function(result){
            logging.debug_message(result['data']);
            res.status(200).json(result['data']);
    }).catch( function(err){
            logging.debug_message(err);
            res.status(404).send("Not found!")
    });
};

exports.get_cats = get_all;
