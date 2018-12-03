/**
 * Adapted from js created by donaldferguson on 8/26/18.
 */

// jshint node: true

// Initialize and get a copy of the DO to support this BO.
const pdo = require('./productdo');
let logging = require('../../lib/logging');
let return_codes =  require('../return_codes');                     // Come standard return codes for the app.
let moduleName = "productbo.";                                    // Sort of used in logging messages.
let sandh = require('../../lib/salthash');



// Business logic may dictate that not all parameters are queryable.
// This should probably be part of a configurable framework that all BOs and use.
let validQParams = ['id', 'name', 'description', 'price', 'category', 'img_url'];
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


// Same idea for checking update information.
//@TODO: implement (decide business logic for what is allowed)
let validateCreateData = function(data) {
    // I feel lucky.
    return true;
};

// Fields to return from queries from non-admins.
// All of this needs to be in a reusable framework, otherwise I will repeat functions in every BO.
let fields_to_return = ['id', 'name', 'description', 'price', 'category', 'img_url'];
let filter_response_fields = function (result, context) {

    // We would ONLY filter return values if this is not an internal, admin request.
    if (context.adminOperation) {
        return result;
    }

    let new_result = null;
    if (result != null) {
        new_result = {};
        for (let i = 0; i < fields_to_return.length; i++) {
            let n = fields_to_return[i];
            new_result[n] = result[n];
        }
    }
    return new_result;
};



// I did not do this as a JavaScript "class." No particular reason.
exports.retrieveById = function(id, fields, context) {
    let functionName = "retrieveById:";
    let productdo = new pdo.ProductDAO();

    return new Promise(function (resolve, reject) {

        productdo.retrieveById(parseInt(id), fields, context).then(
            function (result) {
                console.log(result);
                result = filter_response_fields(result, context);
                resolve(result);
            },
            function (error) {
                logging.error_message(moduleName + functionName + "jerrorn = ", error);
                reject(return_codes.codes.internal_error);
            }
        )
    });
};

exports.retrieveByCategory = function(categ, fields, context) {
    let functionName = "retrieveByCategory";
    let productdo = new pdo.ProductDAO();

    let the_context = context;
    logging.debug_message("RRETRIEVING BY CATEGORY")
    logging.debug_message(categ);
    return new Promise(function (resolve, reject) {

        productdo.retrieveByTemplate({category: categ}, fields, context).then(
            function (result) {
                console.log(result);
                res2 = [];
                for (index = 0; index < result.length; index++) {
                        res2.push(filter_response_fields(result[index], context));
                }
                resolve(res2);
            },
            function (error) {
                logging.error_message(moduleName + functionName + "jerrorn = ", error);
                reject(return_codes.codes.internal_error);
            }
        )

    });
};


exports.retrieveByTemplate = function(template, fields, context) {
    let functionName = "retrieveByTemplate";
    let productdo = new pdo.ProductDAO();

    let the_context = context;

    return new Promise(function (resolve, reject) {

        if (validateQueryParameters(template, the_context) == false) {
            reject(return_codes.codes.invalid_query);
        }
        else {
            productdo.retrieveByTemplate(template, fields, context).then(
                function (result) {
                    //logging.debug_message(moduleName + functionName + "Result = ", result);
                    result = result.map(function(stuff) {
                        return filter_response_fields(stuff, the_context);
                    });
                    resolve(result);
                },
                function (error) {
                    logging.error_message(moduleName + functionName + "error = ", error);
                    reject(return_codes.codes.internal_error);
                }
            );
        }

    });
};

exports.create = function(data, context) {
    let functionName = "create";
    var productdo = new pdo.ProductDAO();


    return new Promise(function (resolve, reject) {
        if (!context.hasOwnProperty('adminOperation') || !context.adminOperation) {
                 reject(return_codes.codes.internal_error);
                 return;
        }


        productdo.maxid(context).then(
        function(result) {
        data.id = result + 1;
        let dide = data.id;
        productdo.create(data, context).then(
            function (result) {
                logging.debug_message(moduleName + functionName + "Result = ", result);
                    /*
                    This part is due to the fact that I cannot get Waterline to run custom queries.
                    Need to find the ID. Relying on the fact that the email is unique.
                     */
                exports.retrieveByTemplate({id: dide}, null, context).then(
                    function(result) {
                        resolve({id: result[0].id});
                    },
                    function(error) {
                        logging.error_message(moduleName + functionName + "error trying to get ID  = ", error);
                    }
                );
            },
            function (error) {
                logging.error_message(moduleName + functionName + "Yerror = ", error);
                reject(error);
            }
        )
        }, function(error) {
            logging.error_message(moduleName + functionName + "Yerror = ", error);
            reject(error);
        });


    });
};
