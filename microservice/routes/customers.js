let express = require('express');
let logging = require('../lib/logging');
let return_codes = require('../resources/return_codes');
let cbo = require('../resources/customers/customersbo');
let login_registration = require('../resources/customers/login_register_bo');
let _passreset = require('../resources/passreset/passreset');
let mail = require('../mail');
let crypto = require('crypto');
let sandh = require('../lib/salthash');
let email_activation = require('../resources/activation/activation');
let env = require('../env');


let moduleName = "customers.";

let get_admin_operation = function(user) {
        var apigClientFactory = require('aws-api-gateway-client').default;

        var apigClient = apigClientFactory.newClient({
                invokeUrl: invokeU
        });

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
            e.resource = "customers";
            let url = "/api/" + e.resource + "/" + e.id;
            let links = [];
            links.push({rel: "self", href: url});
            let result = { msg: "Created", links: links, id: e.id };

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
            let url = "/api/" + e.resource + "/" + e.id;
            let links = [];
            links.push({rel: "self", href: url});
            let result = { msg: "LoggedIn", links: links };
            res.set("Authorization", e.token);
            res.status(201).json(result);
            break;
        }

        case return_codes.codes.login_failure.code: {
            res.status(403).json('Forbidden: Invalid credentials');
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
//let register = function(req, res, next, w_manager, rclient) {
let register = function(req, res, next, rclient) {
    let functionName="register:"

    let data = req.body;

    var admop = 0;//get_admin_operation(req.query['user']);
    let context = {tenant: req.tenant, adminOperation: admop};

    logging.debug_message(moduleName+functionName + "tenant  = ", req.tenant);
    logging.debug_message(moduleName+functionName + "body  = ", data);

    //login_registration.register(data, context, w_manager, rclient).then(
    login_registration.register(data, context, rclient).then(
        function(result) {
            if (result) {
                    logging.debug_message("ASDKFLASJDKFASLK")
               logging.debug_message(result);
               map_response(result, res);
            }
            else {
                logging.debug_message("error with result undefined");
                reject(return_codes.codes.internal_error);
            }
        },
        function(error) {
            logging.error_message(moduleName+functionName + " error = ", error);
            map_response(error, res);
        }
        );
};

//let login = function(req, res, next, w_manager) {
let login = function(req, res, next) {
    let functionName = "login:"

    let data = req.body;
    var admop = 0;// get_admin_operation(req.query['user']);
    let context = {tenant: req.tenant, adminOperation: admop};

    logging.debug_message(moduleName + functionName + "tenant  = ", req.tenant);
    logging.debug_message(moduleName + functionName + "body  = ", data);

    //login_registration.login(data, context, w_manager).then(
    login_registration.login(data, context).then(
        function(result) {
            map_response(result, res);
        },
        function(error) {
            logging.error_message(moduleName + functionName + " error = ", error);
            res.status(500).json(error);
        }
    ).catch(function(exc) {
        logging.error_message(moduleName + functionName + " exception = ", exc);
        res.status(500).json(exc);
    });
};

let changeAddress = function(req, res, next) {
    let functionName = "changeAddress:"

    let data = req.body;
    var admop = 0;// get_admin_operation(req.query['user']);
    let context = {tenant: req.tenant, adminOperation: admop};

    logging.debug_message(moduleName + functionName + "tenant  = ", req.tenant);
    logging.debug_message(moduleName + functionName + "body  = ", data);

    //login_registration.login(data, context, w_manager).then(
    cbo.setAddress(req.params.userID, data.address1, /*data.address2, data.city,
            data.state, data.zip,*/ 'null', 'null', 'NA', 'null',
            context).then(
        function(result) {
            //map_response(result, res);
            res.status(200).json("Good to go!");
        },
        function(error) {
            logging.error_message(moduleName + functionName + " error = ", error);
            res.status(500).json(error);
        }
    ).catch(function(exc) {
        logging.error_message(moduleName + functionName + " exception = ", exc);
        res.status(500).json(exc);
    });
};

let tokenLogin = function(req, res, next) {
    let functionName = "tokenLogin: "

    let data = req.body;
    var admop = 0;
    let context = {tenant: req.tenant, adminOperation: admop};

    login_registration.tokenLogin(data, context).then(
        function(result) {
            map_response(result, res);
            // res.status(200).json(result);
        },
        function(error) {
            logging.error_message(moduleName + functionName + " error = ", error);
            res.status(500).json(error);
        }
    ).catch(function(exc) {
        logging.error_message(moduleName + functionName + " exception = ", exc);
        res.status(500).json(exc);
    });
};

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

//let passresetreq = function(req, res, next, w_manager, rclient) {
let passresetreq = function(req, res, next, rclient) {
    let functionName = "passresetreq:";
    let data = req.body;

    var admop = 0;// get_admin_operation(req.query['user']);
    let context = {tenant: req.tenant, adminOperation: admop};


    logging.debug_message(moduleName + functionName + "body = ", data);

    let fields = ['*'];
    //cbo.retrieveByEmail(data.user_email, fields, context, w_manager).then(
    cbo.retrieveByEmail(data.email, fields, context).then(
        function(result) {
            if(result.length > 0) {
                result = result[0];
                let sha = crypto.createHash('sha1');
                let random_nonce = getRandomInt(Date.now());
                let token = sha.update(result.email + random_nonce).digest('hex');
                _passreset.insert_reset_token(rclient, token, result.id);
                mail.sendPassResetEmail('localhost:3000/forgotpassword/' + token, result.email);
                res.status(201).json("Password reset email sent");
            }
            else {
                res.status(201).json("Forbidden, because not a valid email")
            }
        },
        function(error) {
            logging.debug_message(moduleName + functionName + "error = ", error);
            res.status(403).json("Error!");
        }
    ).catch(function(exc) {
        logging.debug_message('passresetreq exception: ', exc);
        res.status(403).json("Exception!");
    });
};

//let passreset = function(req, res, next, w_manager, rclient) {
let passreset = function(req, res, next, rclient) {
    let functionName = "passreset:";
    let data = req.body;
    var admop = 0;// get_admin_operation(req.query['user']);
    let context = {tenant: req.tenant, adminOperation: admop};

    logging.debug_message(moduleName + functionName + "body = ", data);
    logging.debug_message(moduleName + functionName + "cookies = ", req.cookies);

    _passreset.get_cid(rclient, req.cookies["reset_token"]).then(
        function(cid) {
            if(cid) {
                let fields = ['*'];
                let context = {};
                //cbo.retrieveById(cid, fields, context, w_manager).then(
                cbo.retrieveById(cid, fields, context).then(
                    function(c) {
                        if(c) {
                            let data = req.body;
                            if(sandh.compare(data.new_password, c.pw)) {
                                res.status(403).json('Forbidden: Can\'t use the old password');
                            }
                            else {
                                //cbo.updatePassword(c.cid, data.new_password, w_manager).then(
                                cbo.updatePassword(c.cid, data.new_password, context).then(
                                    function(success) {
                                        _passreset.erase_reset_token(rclient, req.cookies["reset_token"]);
                                        res.status(201).json("Password reset successfully!");
                                    },
                                    function(error) {
                                        console.log("passreset -> cbo.updatePassword error: ", error);
                                        res.status(500).json("passreset -> cbo.updatePassword error: ", error);
                                    }
                                ).catch(function(exc) {
                                    console.log("passreset -> cbo.updatePassword exception: ", exc);
                                    res.status(500).json("passreset -> cbo.updatePassword exception: ", exc);
                                });
                            }
                        }
                        else {
                            console.log("Token-CID pair invalid. Get a new reset link");
                            res.status(403).json("No CID for this token. Get a new reset link");
                        }
                    },
                    function(error) {
                        console.log("passreset error: ", error);
                        res.status(500).json("passreset error: ", error);
                    }
                ).catch(function(exc) {
                    console.log("passreset exception: ", exc);
                    res.status(500).json("passreset exception: ", exc);
                });
            }
            else {
                res.status(403).json("Invalid reset token. Get a new reset token");
            }
        },
        function(error) {
            console.log("passreset->getcid error: ", error);
            res.status(500).json("_passreset.get_cid error");
        }
    ).catch(function(exc){
        console.log("passreset->getcid exception: ", exc);
        res.status(500).json("_passreset.get_cid exception");
    });

}

//let activate_account = function(req, res, next, wm, rclient) {
let activate_account = function(req, res, next, rclient) {
    var admop = 0;// get_admin_operation(req.query['user']);
    let context = {tenant: req.tenant, adminOperation: admop};

    return new Promise(function(resolve, reject) {
        email_activation.get_email(rclient, req.params.activation_token).then(
            function(email) {
                 //cbo.activateAccount(email, wm).then(
                 cbo.activateAccount(email, context).then(
                    function(success) {
                        resolve("Your account has been activated");
                    },
                    function(error) {
                        reject(error);
                    }
                )
                .catch(function(exc) {
                    reject(exc);
                });

            },
            function(error) {
                logging.error_message("customers.activate_account error: ", error);
                reject(error);
            }
        ).catch(function(exc) {
            logging.error_message("customers.activate_account exception: ", exc)
        });
    });
}

let post = function(req, res, next) {

    let functionName="post:"

    let data = req.body;
    let context = {tenant: req.tenant};

    logging.debug_message(moduleName+functionName + "tenant  = ", req.tenant);
    logging.debug_message(moduleName+functionName + "body  = ", data);


    cbo.create(data, context).then(
        function(result) {
            if (result) {
                res.status(201).json(result);
            }
        },
        function(error) {
            logging.error_message(moduleName+functionName + " error = ", error);
            map_response(error, res);
        }
    );

};


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
        //cbo.retrieveById(req.params.id, fields, context, w_manager).then(
        cbo.retrieveById(req.params.id, fields, context).then(
            function(result) {
                if (result) {
                        logging.debug_message("ASDFASDFASDF")
                        logging.debug_message(result)
                    res.status(200).json(result);
                }
                else {
                    res.status(404).send("Not found!")
                }
            },
            function(error) {
                logging.debug_message("customers.get: error = " + error);
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
      res.status(500).send("Boom!");
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
        logging.debug_message('customers.get: query = ', req.query);

        cbo.retrieveByTemplate(req.query, fields, context).then(
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
        res.status(500).send("Boom!");
    }
};

exports.get_by_id = get_by_id;
exports.get_by_query = get_by_query;
exports.post = post;
exports.register = register;
exports.login = login;
exports.tokenLogin = tokenLogin;
exports.passreset = passreset;
exports.passresetreq = passresetreq;
exports.activate_account = activate_account;
exports.changeAddress = changeAddress;
