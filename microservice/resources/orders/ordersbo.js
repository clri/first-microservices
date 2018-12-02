/**
 * Adapted from js created by donaldferguson on 8/26/18.
 */


// Initialize and get a copy of the DO to support this BO.
const odo = require('./ordersdo');
let logging = require('../../lib/logging');
let return_codes =  require('../return_codes');                     // Come standard return codes for the app.
let moduleName = "ordersbo.";
let uuid = require('uuid/v4');
let customersbo = require('../customers/customersbo')
let env = require('../../env');

let invokeU = env.getApig();
let ordersdo = new odo.OrdersDAO();

var paramz = {};
var bodyy = {};

var apigClientFactory = require('aws-api-gateway-client').default;

var apigClient = apigClientFactory.newClient({
        invokeUrl: invokeU
});

// Business logic may dictate that not all parameters are queryable.
// This should probably be part of a configurable framework that all BOs and use.
let validQParams = ['lastName', 'firstName', 'email', 'status'];
let validateQueryParameters = function(template, context) {
    // We would ONLY filter  values if this is not an internal, admin request.
    if (context.adminOperation) {
        return true;
    };

    let keys = Object.keys(template);
    for (let i = 0; i < keys.length; i++) {
        let pos = validQParams.indexOf(keys[i]);
        if (pos == -1) {
            return false;
        }
    }
    return true;
};

// Same idea for checking create information.
//@TODO: implement (make sure all required fields aside from date/custid are there)
let validateCreateData = function(data, context) {
    // make sure necessary fields are there
    if (! (data.hasOwnProperty('id') && data.hasOwnProperty('customer') &&
        data.hasOwnProperty('items') )) {
                return false;
        }
    //make sure unnecessary fields are not there
    for (var attr in data) {
            if (['id', 'customer', 'items'].includes(attr) == false) {
                    return false;
            }
    }
    //@TODO: foreign key relationship to products
    //because of waterline being tricky, we will call a lambda function here
    var adpar = {
            queryParams: {
                    items: data['items']
            }
    };

    logging.debug_message("AAAAAA*******AAAAAAA")
    apigClient.invokeApi(paramz, '/validateOrders', 'GET', bodyy, adpar)
    .then(function(result){
            lans = result['data'];
            //logging.debug_message(lans);
            if (lans['valid'] == 0) {
                    return false;
            } else {
                    data['totalPrice'] = lans['totalPrice'];
            }
    }).catch( function(err){
            logging.debug_message(err);
            return false;
    });


    //make sure the customer is a valid customer
    customersbo.retrieveById(data['customer'], ['id'], context).then(
        function(result) {
                logging.debug_message('124');
            return true;
        })
        .catch(
            function(error) {
                    logging.debug_message('1');
                return false;
            }
        );
};

// Fields to return from queries from non-admins.
// All of this needs to be in a reusable framework, otherwise I will repeat functions in every BO.
let fields_to_return = ['id', 'customer', 'items', 'totalPrice', 'created'];
let filter_response_fields = function (result, context) {

    // We would ONLY filter return values if this is not an internal, admin request.
    if (context.adminOperation) {
        return result;
    }
    console.log("*&*");
    //console.log(result);
    let new_result = [];
    for (let j = 0; j < result.length; j++) {
        let resulti = result[j];
        let new_resulti = {};
        //if (result) {
            for (let i = 0; i < fields_to_return.length; i++) {
                let n = fields_to_return[i];
                logging.debug_message(n);
                new_resulti[n] = resulti[n];
            }
        //}
        new_result.push(new_resulti);
    }
    return new_result;
};



exports.retrieveById = function(id, fields, context) {
    let functionName = "retrieveById:";
    //let ordersdo = new odo.OrdersDAO();

    return new Promise(function (resolve, reject) {

        ordersdo.retrieveById(id, fields, context).then(
            function (result) {
                console.log(result);
                result = filter_response_fields(result, context);
                console.log(result);
                if (result.hasOwnProperty('items') && (typeof result['items'] != 'undefined')) {
                        oitms = []
                        for (var ii = 0; ii < result['items'].length; ii++) {
                                oitms.push(parseInt(result['items'][ii]))
                        }
                        result['items'] = oitms
                }
                resolve(result);
            },
            function (error) {
                logging.error_message(moduleName + functionName + "error = ", error);
                reject(return_codes.codes.internal_error);
            }
        )
    });
};



exports.create = function(data, context) {
    let functionName = "create";


    return new Promise(function (resolve, reject) {
        logging.debug_message('1');
        data['id'] = uuid();
        logging.debug_message('2');

        if (validateCreateData(data, context) == false) {
            reject(return_codes.codes.invalid_create_data);
        }
        else {
            oitms = []
            for (var ii = 0; ii < data['items'].length; ii++) {
                    oitms.push(data['items'][ii].toString())
            }

            data['items'] = oitms
            ordersdo.create(data, context).then(
                function (result) {
                    logging.debug_message(moduleName + functionName + "Result = ", result);
                    //logging.debug_message(result['id']);
                    //@TODO: JSON to objects
                    resolve(result);
                },
                function (error) {
                    logging.error_message(moduleName + functionName + "Yerror = ", error);
                    reject(error);
                }
            );
        }

    });
};

//@Potential TODO: set order to shipped/delivered??
