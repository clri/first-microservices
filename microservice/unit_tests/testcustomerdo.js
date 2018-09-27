/**
 * Created by donaldferguson on 8/26/18.
 */

const logging = require('../lib/logging');
const cdo =
    require('../resources/customers/customersdo');

let theCdo = new cdo.CustomersDAO();

const testA = function() {
    theCdo.retrieveById('kamc1', ['lastName', 'email'], {tenant: 'tenant1'}).then(
        function(result) {
            logging.debug_message("testA result = ", result);
        })
        .catch(
            function(error) {
                logging.error_message("testA error = " + error);
            });
};

const testB = function() {
    theCdo.retrieveByTemplate({firstName: "Jameela"}, null, {tenant: 'tenant1'}).then(
        function(result) {
            logging.debug_message("testB result = ", result);
        })
        .catch(
            function(error) {
                logging.error_message("testB error = " + error);
            });
};

const testC = function(d) {
    theCdo.create(d, {tenant: 'E6156'}).then(
        function(result) {
            logging.debug_message("testC result = ", result);
        })
        .catch(
            function(error) {
                logging.error_message("testC error = " + error);
            });
};

const testD = function() {

    let tmp = { firstName: "Kate"}
    let fields = { status: "Pending"}

    theCdo.update(tmp, fields, {tenant: 'tenant1'}).then(
        function(result) {
            logging.debug_message("testD result = ", result);
        })
        .catch(
            function(error) {
                logging.error_message("testD error = " + error);
            });
};

const testE = function() {

    let tmp = { firstName: "Kate"}

    theCdo.delete(tmp, {tenant: 'tenant1'}).then(
        function(result) {
            logging.debug_message("testE result = ", result);
        })
        .catch(
            function(error) {
                logging.error_message("testE error = " + error);
            });
};


let test_create = {
    id: 'lm11',
    lastName: "Messi",
    firstName: 'Lionel',
    email: 'lionel@fcp.es',
    status: 'PENDING',
    pw: "realmadrid"
};

//testA();
//testB();
//testC(test_create);
//testD()
testE()
