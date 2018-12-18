/**
 * Adapted from js created by donaldferguson on 8/26/18.
 */

// jshint node: true

// Initialize and get a copy of the DO to support this BO.
const cdo = require('./customersdo');
let logging = require('../../lib/logging');
let return_codes =  require('../return_codes');                     // Come standard return codes for the app.
let moduleName = "customersbo.";                                    // Sort of used in logging messages.
let sandh = require('../../lib/salthash');

    const http = require('http');
    const axios = require('axios');

//@TODO: implement generateID function that does not rely on triggers
//but that works with Waterline
let generateId = function(lastName, firstName) {

    let p1 = firstName.substr(0,2);
    let p2 = lastName.substr(0,2);
    let newId = p1 + p2;
    return newId;
};

let captureAddress = function(req, res, next) {

    let address = req.body.newaddress;
    let addresstype = req.body.addresstype;

    var admop = 0;// get_admin_operation(req.query['user']);
    let context = {tenant: req.tenant, adminOperation: admop};

    this.setAddress("", address, addresstype, "", "", "", context)
};

let captureAddress2 = function(req, res, next) {

    let address = req.body.updatenewaddress;

    var admop = 0;// get_admin_operation(req.query['user']);
    let context = {tenant: req.tenant, adminOperation: admop};

    this.setAddress("", address, "", "", "", "", context)
};


// Business logic may dictate that not all parameters are queryable.
// This should probably be part of a configurable framework that all BOs and use.
let validQParams = ['lastName', 'firstName', 'email', 'status', 'address1', 'address2', 'city', 'state', 'zip'];
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
let validateCreateData = function(data) {
    // I feel lucky.
    return true;
};

// Same idea for checking update information.
//@TODO: implement (decide business logic for what is allowed)
let validateUpdateData = function(data) {
    // I feel lucky.
    return true;
};

// Fields to return from queries from non-admins.
// All of this needs to be in a reusable framework, otherwise I will repeat functions in every BO.
let fields_to_return = ['id', 'lastName', 'firstName', 'email', 'last_login', 'created', 'pw', 'status', 'address1', 'address2', 'city', 'state', 'zip'];
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
    let customersdo = new cdo.CustomersDAO();

    return new Promise(function (resolve, reject) {

        customersdo.retrieveById(id, fields, context).then(
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


exports.retrieveByEmail = function(email, fields, context) {
    let functionName = "retrieveByEmail";
    let customersdo = new cdo.CustomersDAO();

    let template = { email: email }
    let the_context = context;
    return new Promise(function(resolve, reject) {
        customersdo.retrieveByTemplate(template, fields, the_context).then(
            function(result) {
                logging.debug_message(result);
                resolve(result);
            },
            function(error) {
                logging.debug_message("customersbo.retrieveByEmail error: ", error);
                reject(error);
            }
        ).catch(function(exc) {
            logging.debug_message("customersbo.retrieveByEmail exception: ", exc);
            reject(exc);
        });
    });
}

exports.retrieveByTemplate = function(template, fields, context) {
    let functionName = "retrieveByTemplate";
    let customersdo = new cdo.CustomersDAO();

    let the_context = context;

    return new Promise(function (resolve, reject) {

        if (validateQueryParameters(template, the_context) == false) {
            reject(return_codes.codes.invalid_query);
        }
        else {
            customersdo.retrieveByTemplate(template, fields, context).then(
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
    var customersdo = new cdo.CustomersDAO();
    return new Promise(function (resolve, reject) {

        data.id = generateId(data.lastName, data.firstName);
        // data.status = "PENDING";

        let email = data.email;
        logging.debug_message(data);
        logging.debug_message("asdf");
        if (validateCreateData(data) == false) {
            reject(return_codes.codes.invalid_create_data);
        }
        else {
            customersdo.create(data, context).then(
                function (result) {
                    logging.debug_message(moduleName + functionName + "Result = ", result);
                    /*
                    This part is due to the fact that I cannot get Waterline to run custom queries.
                    Need to find the ID. Relying on the fact that the email is unique.
                     */
                    exports.retrieveByTemplate({email: email}, null, context).then(
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
            );
        }

    });
};

exports.activateAccount = function(em, context) {
    let customersdo = new cdo.CustomersDAO();
    console.log(em);
    let template = {
        //where: {email: em}
        email: em
    }
    let updates = {
        status: "ACTIVE"
    }

    return new Promise(function(resolve, reject) {
        customersdo.update(template, updates, context).then(
            function(success) {
                console.log("Account activated successfully", em);
                resolve(success);
            },
            function(error) {
                console.log("customersbo.activateAccount error: ", error);
                reject(error);
            }
        ).catch( function(exc) {
            console.log("customersbo.activateAccount exception: ", exc);
            reject(exc);
        });
    });
}

exports.updatePassword = function(cid, new_password, context) {
    let functionName = "create";
    let customersdo = new cdo.CustomersDAO();

    let template = {
        //where: {id: cid}
        id: cid
    }
    let updates = {
        pw: sandh.saltAndHash(new_password)
    }

    return new Promise(function(resolve, reject) {
        customersdo.update(template, updates, context).then(
            function(success) {
                resolve(success);
            },
            function(error) {
                logging.debug_message("customersbo.update error: ", error);
                reject(error);
            }
        ).catch(function(exc) {
            logging.debug_message("customersbo.update exception: ", exc);
        });
    });

};

exports.getAddress = function(id, context) {
        let functionNAme = "getAddress"
        let customersdo = new cdo.CustomersDAO();
        let fields = ['address1', 'address2', 'city', 'state', 'zip']

        return new Promise(function (resolve, reject) {

            customersdo.retrieveById(id, fields, context).then(
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

}

let check_address = function(street) {
    let base_url = "https://us-street.api.smartystreets.com/street-address?street=";
    let auth_id = "c86cf98f-4f9f-d9d0-819a-e98a39f2a318";
    let auth_token = "NWG3q8Lp3L4OJ9OWJi2z";
    let get_url = base_url + street;
    get_url += "&auth-id=" + auth_id + "&auth-token=" + auth_token;
    let encoded = encodeURI(get_url);

    let data = '';
    //logging.debug_message(encoded);
    return new Promise(function (resolve, reject) {
    axios.get(encoded).then(resp => {
            logging.debug_message("ASDFASDF")
            logging.debug_message(resp);
            if (resp.data.length == 0) {
                    resolve(false);
            }
            resolve(true);
    }).catch(err => {
            logging.debug_message(err);//err.message);
            resolve( false);

    });
})
};

exports.setAddress = function(cid, new_a1, new_a2, new_city, new_state, new_zip, context) {
        let functionName = "setAddress"
        let customersdo = new cdo.CustomersDAO();

        let template = {
            //where: {id: cid}
            id: cid
        }
        let updates = {
            address1: new_a1,
            address2: new_a2,
            city: new_city,
            state: new_state,
            zip: new_zip
        }
        console.log("Set address");
        logging.debug_message(new_a1);
        //@TODO: validate address with smartystreets
        let was_valid = check_address(new_a1);
        if (was_valid) {
                logging.debug_message("was valid")
            return new Promise(function (resolve, reject) {
                customersdo.update(template, updates, context).then(
                    function (success) {
                            logging.debug_message(success);
                        resolve(success);
                    },
                    function (error) {
                        logging.debug_message("customersbo.update error: ", error);
                        reject(error);
                    }
                ).catch(function (exc) {
                    logging.debug_message("customersbo.update exception: ", exc);
                    reject(exc)
                });
            });
        }
        else{
            //wasn't valid address
            return;
        }
}
