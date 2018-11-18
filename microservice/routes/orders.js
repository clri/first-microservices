let express = require('express');
let logging = require('../lib/logging');
let return_codes = require('../resources/return_codes');
let obo = require('../resources/orders/ordersbo');

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



exports.get_by_id = get_by_id;
