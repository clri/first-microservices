let express = require('express');
let logging = require('../lib/logging');
let return_codes = require('../resources/return_codes');
let cbo = require('../resources/cart/cartbo');
let env = require('../env');

let invokeU = env.getApig();

var params = {};
var body = {};
var adpar = {};

var apigClientFactory = require('aws-api-gateway-client').default;

var apigClient = apigClientFactory.newClient({
        invokeUrl: invokeU
});

let moduleName = "cart.";


let get_by_id = function(req, res, next) {

    let functionName = "get_by_id:"

    logging.debug_message(moduleName + functionName + "tenant  = ", req.tenant);
    logging.debug_message(moduleName + functionName + "params  = ", req.params);

    // Extract the tenant from the HTTP header.
    let context = {tenant: req.tenant};
    let fields = null;

    try {

        fields = ['id', 'customer', 'items', 'created']
        //logging.debug_message("ORDERS ID IS " + req.params.id);
        //logging.debug_message("ORDERS TENANT " + req.tenant);
        //cbo.retrieveById(req.params.id, fields, context, w_manager).then(
        cbo.retrieveById(req.params.id, fields, context).then(
            function(result) {
                if (result) {
                    logging.debug_message(result);
                    ans = result[0]
                    //@TODO: we have to get the item details here
                    apigClient.invokeApi(params, '/getallProducts', 'GET', body, {})
                    .then(function(result2){
                        var imgs = []
                        var new_items = []
                        var prices = []
                        for (var j = 0; j < result2['data'].length; j++) {
                            if (ans['items'].includes(result2['data'][j].id.toString())) {
                                imgs.push(result2['data'][j].img_url)
                                new_items.push(result2['data'][j].id)
                                prices.push(result2['data'][j].price)
                            }
                        }
                        ans.imgs = imgs
                        ans.img_key = new_items //maps items to imgs by index
                        ans.prices = prices
                        res.status(200).json(ans)
                    }).catch( function(err){
                        logging.debug_message(err);
                        res.status(404).send("Not found!")
                    });
                }
                else {
                    logging.debug_message("cart.get: no orders availabel");
                    res.status(404).send("Not found!")
                }
            },
            function(error) {
                logging.debug_message("cart.get: error = " + error);
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

let add_to_cart = function(req, res, next) {
    let functionName = "add_to_cart:"

    logging.debug_message(moduleName + functionName + "tenant  = ", req.tenant);
    logging.debug_message(moduleName + functionName + "params  = ", req.params);

    let context = {tenant: req.tenant};
    let data = {
            customer : req.params.id,
            items : [req.params.item]
    }

    try {
      cbo.addToCart(data, context).then(
        function(result) {
                logging.debug_message(result)
                res.status(200).send("Added to cart!");
        }, function(error) {
                logging.debug_message("cart.add: nothing");
                res.status(500).send("Could not add!")
        }
      );

    }
    catch(e) {
      logging.error_message("e = " + e);
      res.status(500).send("Boomf!111");
    }

}



exports.get_by_id = get_by_id;
exports.add_to_cart = add_to_cart;
