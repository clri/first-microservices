let express = require('express');
let logging = require('../lib/logging');
let return_codes = require('../resources/return_codes');
const hash = require('../lib/salthash');
let security = require('../middleware/security');
let customer_dao = require('../resources/customers/customer_dao');

let moduleName = "customers.";


let map_response = function(e, res) {


    let mapped_error = {};

    switch(e.code) {

        case return_codes.codes.uniqueness_violation.code: {
            res.status(409).json("Duplicate data.");
            break;
        }

        case return_codes.codes.registration_success.code: {

            // POST is "creating" something. We will return
            // 201 -- created.
            // A link to the thing created. This should probably be in a links header..
            e.resource="customers";
            let url = "/" + e.resource + "/" + e.id;
            let links = [];
            links.push({rel: "self", href: url});
            let result = { msg: "Created", links: links };

            // If there is a generated security token, return it.
            if (e.token) {
                res.set("Authorization", e.token);
            }

            res.status(201).json(result);
            break;
        }

        // Basically, same logic as above but for login, which is also a POST.
        case return_codes.codes.login_success.code: {
            e.resource="customers";
            let url = "/" + e.resource + "/" + e.id;
            let links = [];
            links.push({rel: "self", href: url});
            let result = { msg: "Created", links: links };
            res.set("Authorization", e.token);
            res.status(201).json(result);
            break;
        }

        // There are MANY other error codes we need to handle.
        default: {
            res.status(500).json("Why is it always me?");
            break;
        }

    }

    return mapped_error;

};

// This function and login should probably be in separate route handlers, but I am lazy.
// You have probably noticed this by now.
let register = function(req, res, next, w_manager) {
    let functionName = "register:"
    let data = req.body;

    // by default, any new customer's account is unverified, so PENDING
    data.status = "PENDING";
    data.pw = hash.saltAndHash(data.pw);
    logging.debug_message(moduleName + functionName + "body  = ", data);

    c_dao = new customer_dao.CustomerDAO(w_manager);
    c_dao.create(data).then(
        function(success) {

            // if succeeds, the success variable contains the created customer
            let this_customer = success;

            // console.log(this_customer);


            let result = return_codes.codes.registration_success;
            let claim = security.generate_customer_claims(this_customer, {tenant: "E6156"});
            console.log("Returning register token = " + JSON.stringify(claim, null, 2));
            result.token = claim;
            result.resource = "customers";
            result.id = this_customer.id;
            return result;
        },
        function(error) {
            let result = return_codes.codes.internal_error;
            return result;
        }
    ).then(
        function(result) {
            map_response(result, res);
            return result;
        }
    ).catch(function(exception) {
        logging.debug_message("c_dao.create exception: ", exception);
        res.status(500).json("c_dao.create exception: " + exception);
    });
};

let login = function(req, res, next, w_manager) {
    let functionName = "login:"
    let data = req.body;
    logging.debug_message(moduleName + functionName + "body  = ", data);


    // get the DAO object for Customers table and retrieve customer's record by his/her email address
    let c_dao = new customer_dao.CustomerDAO(w_manager);
    let fields = ['*'];
    let template = {email: data.email};
    c_dao.retrieveByTemplate(template, fields).then(
        function(success) {
            let query_result = success;
            
            // if success, the object success contains the customer with this email-address
            let this_customer = query_result[0];

            // check if the customer is trying to login with the correct credentials
            if(hash.compare(data.pw, this_customer.pw)) {
                let claim = security.generate_customer_claims(this_customer, {tenant: "E6156"});
                let result = return_codes.codes.login_success;
                result.token = claim;
                result.id = this_customer.id;

                return result;
            }
            else {
                let result = return_codes.codes.login_failure;
                return result;
            }
        },
        function(error) {
            return error;
        }
    ).then(
        function(result) {
            map_response(result, res);
        }
    );
};

let post = function(req, res, next) {

    let functionName = "post:"

    let data = req.body;
    let context = {tenant: req.tenant};

    logging.debug_message(moduleName+functionName + "tenant  = ", req.tenant);
    logging.debug_message(moduleName+functionName + "body  = ", data);


    bo.create(data, context).then(
        function(result) {
            if (result) {
                // !!!!!!!
                // Need to get ID to form URL.
                res.status(201).json(result);
            }
        },
        function(error) {
            logging.error_message(moduleName+functionName + " error = ", error);
            map_response(error, res);
        }
    );

};


let get_by_id = function(req, res, next, w_manager) {

    let functionName = "get_by_id:"
    logging.debug_message(moduleName + functionName + "params  = ", req.params);
    let fields = ['*'];
    let c_dao = new customer_dao.CustomerDAO(w_manager);

    c_dao.retrieveById(req.params.id, fields).then(
        function(success) {
            res.status(200).json(success);
        },
        function(error) {
            res.status(500).json("Unexpected error occured");
        }
    )
    .catch(function(exception) {
        res.status(500).json("Exception: " + exception);
    });
};

let get_by_query =  function(req, res, next) {

    logging.debug_message("tenant  = ", req.tenant);
    logging.debug_message("params  = ", req.params);
    logging.debug_message("query  = ", req.query);

    context = {tenant: req.tenant};

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
        logging.debug_message('customers.get: query = ', req.query);

        bo.retrieveByTemplate(req.query, fields, context).then(
            function (result) {
                logging.debug_message("bo.retrieveById: result = ", result);
                if (result) {
                    res.status(200).json(result);
                }
                else {
                    res.status(404).send("Not found!")
                }
            },
            function (error) {
                if (error.code && error.code == return_codes.codes.invalid_query.code) {
                    res.status(400).send("You are a teapot.")
                }
                else {
                    res.status(500).send("Internal error.");
                }
            }
        );
    }
    catch (e) {
        logging.error_message("e = " + e);
        res.status(500).send("Boom!");
    }
};

exports.get_by_id = get_by_id;
exports.get_by_query = get_by_query;
exports.post = post;
exports.register = register;
exports.login = login;
