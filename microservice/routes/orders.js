let express = require('express');
let logging = require('../lib/logging');
let return_codes = require('../resources/return_codes');
let obo = require('../resources/orders/ordersbo');
let env = require('../env');

let invokeU = env.getApig();

var params = {};
var body = {};
var adpar = {};

var apigClientFactory = require('aws-api-gateway-client').default;

var apigClient = apigClientFactory.newClient({
        invokeUrl: invokeU
});

let moduleName = "orders.";


let get_by_id = function(req, res, next) {

    let functionName = "get_by_id:"

    logging.debug_message(moduleName + functionName + "tenant  = ", req.tenant);
    logging.debug_message(moduleName + functionName + "params  = ", req.params);

    // Extract the tenant from the HTTP header.
    let context = {tenant: req.tenant};
    let fields = null;

    try {

        fields = ['id', 'customer', 'items', 'totalPrice', 'created']
        //logging.debug_message("ORDERS ID IS " + req.params.id);
        //logging.debug_message("ORDERS TENANT " + req.tenant);
        //cbo.retrieveById(req.params.id, fields, context, w_manager).then(
        obo.retrieveById(req.params.id, fields, context).then(
            function(result) {
                if (result) {
                    logging.debug_message(result);
                    res.status(200).json(result);
                }
                else {
                    logging.debug_message("orders.get: no orders availabel");
                    res.status(404).send("Not found!")
                }
            },
            function(error) {
                logging.debug_message("orders.get: error = " + error);
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
      res.status(500).send("Boom!111");
    }

};

let get_by_oid = function(req, res, next) {

    let functionName = "get_by_oid:"

    logging.debug_message(moduleName + functionName + "tenant  = ", req.tenant);
    logging.debug_message(moduleName + functionName + "params  = ", req.params);
    //should be id & oid

    // Extract the tenant from the HTTP header.
    let context = {tenant: req.tenant};
    let fields = null;

    try {

        fields = ['id', 'customer', 'items', 'totalPrice', 'created']
        //logging.debug_message("ORDERS ID IS " + req.params.id);
        //logging.debug_message("ORDERS TENANT " + req.tenant);
        //cbo.retrieveById(req.params.id, fields, context, w_manager).then(
        obo.retrieveById(req.params.id, fields, context).then(
            function(result) {
                if (result) {
                    logging.debug_message("*&*&*&*&")
                    logging.debug_message(result);
                    //go through result and discard irrelevant orders
                    for (var i = 0; i < result.length; i++) {
                            logging.debug_message(result[i].id)
                            if (result[i].id == req.params.oid) {
                                    let imgs = []
                                    let new_items = []
                                    let ans = result[i]
                                    logging.debug_message("****found ID")
                                    //@TODO: get products:
                                    apigClient.invokeApi(params, '/getallProducts', 'GET', body, {})
                                    .then(function(result2){
                                        logging.debug_message(result2['data']);
                                        for (var j = 0; j < result2['data'].length; j++) {
                                            if (ans['items'].includes(result2['data'][j].id.toString())) {
                                                imgs.push(result2['data'][j].img_url)
                                                new_items.push(result2['data'][j].id)
                                            }
                                        }
                                        ans.imgs = imgs
                                        ans.img_key = new_items //maps items to imgs by index
                                        logging.debug_message(ans)
                                        res.status(200).json(ans)
                                    }).catch( function(err){
                                        logging.debug_message(err);
                                        res.status(404).send("Not found!")
                                    });
                                    return;
                            }
                    }
                    res.status(404).send("Not found!")
                }
                else {
                    logging.debug_message("orders.get: no orders availabel");
                    res.status(404).send("Not found!")
                }
            },
            function(error) {
                logging.debug_message("orders.get: error = " + error);
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
      res.status(500).send("Boom!111");
    }

};



exports.get_by_id = get_by_id;
exports.get_by_oid = get_by_oid;
