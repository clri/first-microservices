const hash = require('../../lib/salthash');
const cbo =  require('./customersbo');
let crypto = require('crypto');


let logging = require('../../lib/logging');
let return_codes =  require('../return_codes');
let email_activation = require('../activation/activation');
let mail = require('../../mail');


// We will discuss the concept of middleware later in this lecture.
let security = require('../../middleware/security');



// Login function.
// Takes an object containing credentials and determines if login succeeded.
// Only does UID/Password right now.
// TODO: Need to extend to support Facebook and other social media.
//
//exports.login =  function(d, context, wm) {
exports.login =  function(d, context) {

    // Incoming data contains security information.
    // Email.
    // Password
    let pw = d.pw;
    let email = d.email;

    // We are going to retrieve the customer's data using the email address.
    // We want all of the fields.
    let fields = ['*'];
    let template = { email: email};

    // Temporarily indicate that this is an admin operation.
    context.adminOperation = true;

    let the_context = context;


    return new Promise(function(resolve, reject) {
        cbo.retrieveByTemplate(template, fields, the_context).then(
        //cbo.retrieveByTemplate(template, fields, the_context, wm).then(
            function(c) {
                // We found a customer. This was query, which returned an array. Get 1st element.
                c = c[0];

                context.adminOperation = false;

                // Compare the hashed/salted value of the submitted password with the stored version.
                // If it matches, return a new JSON Web Token. We are also going to return the user ID
                // to enable forming a URL or lookup.
                if (hash.compare(pw, c.pw)) {
                    let claim = security.generate_customer_claims(c, context);
                    let result = return_codes.codes.login_success;
                    result.token = claim;
                    result.id = c.id;
                    resolve(result);
                }
                else {
                    resolve(return_codes.codes.login_failure);
                }
            },
            function(error) {
                context.adminOperation = false;
                logging.error_message("logonbo.login: error = " + error);
                reject(return_codes.codes.internal_error);
            }
        ).catch(function(exc) {
            logging.error_message("loginbo.login: exception = ", exc);
            reject(return_codes.codes.internal_error);
        });
    });
};

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

//exports.register =  function(d, context, wm, rclient) {
exports.register =  function(d, context, rclient) {
    d.status = "PENDING";
    return new Promise(function(resolve, reject) {
        //console.log(wm);
        //cbo.create(d, context, wm).then(
        var d_email = d.email;
        cbo.create(d, context).then(
            function(c) {
                let new_result = return_codes.codes.registration_success;
                let claim = security.generate_customer_claims(c, context);
                console.log("Returning register token = " + JSON.stringify(claim, null, 2));
                new_result.token = claim;
                new_result.resource = "customers";
                new_result.id = c.id;

                // add the logic to generate an activation link here
                let random_nonce = getRandomInt(Date.now());
                let sha = crypto.createHash('sha1');
                let activation_token = sha.update(d_email + random_nonce).digest('hex');
                new_result.activation_token = activation_token;

                // insert this (token, cid) pair in the data store 1
                email_activation.insert_activation_token(rclient, activation_token, d_email);
                mail.sendActivationEmail('localhost:3000/activateEmail/' + activation_token, d_email);

                resolve(new_result);
            },
            function(error) {
                logging.error_message("logonbo.register: error = " + error);
                reject(error);
            }
        )
    });
};
