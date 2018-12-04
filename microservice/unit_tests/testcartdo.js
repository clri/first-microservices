/**
 * Created by donaldferguson on 8/26/18.
 */

const logging = require('../lib/logging');
const cdo =
    require('../resources/cart/cartdo');

let theCdo = new cdo.CartDAO();

//pass
const testA = function() {
    theCdo.retrieveById('Messi', ['id', 'items'], {tenant: 'E6156'}).then(
        function(result) {
            logging.debug_message("testA result = ", result);
        })
        .catch(
            function(error) {
                logging.error_message("testA error = " + error);
            });
};

//fail
const testB = function() {
    theCdo.retrieveByTemplate({items: ["Jameela"]}, null, {tenant: 'E6156'}).then(
        function(result) {
            logging.debug_message("testB result = ", result);
        })
        .catch(
            function(error) {
                logging.error_message("testB error = " + error);
            });
};

//pass
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

//pass
const testD = function() {

    let tmp = { id: "lm11", customer: "Messi"}
    let fields = { items: ['1']}

    theCdo.update(tmp, fields, {tenant: 'E6156'}).then(
        function(result) {
            logging.debug_message("testD result = ", result);
        })
        .catch(
            function(error) {
                logging.error_message("testD error = " + error);
            });
};

//pass
const testE = function() {
    let tmp = { id: "lm11", customer: "Messi"}

    theCdo.delete(tmp, {tenant: 'E6156'}).then(
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
    customer: "Messi",
    items: ['item1', 'item2']
};

//testA();
//testB();
//testC(test_create);
//testD()
testE()
