/**
 * Created by donaldferguson on 8/26/18.
 */

const logging = require('../lib/logging');
const odo =
    require('../resources/orders/ordersdo');

let theOdo = new odo.OrdersDAO();

//pass
const testA = function() {
    theOdo.retrieveById('js12', ['id', 'items'], {tenant: 'E6156'}).then(
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
    theOdo.retrieveByTemplate({firstName: "Jameela"}, null, {tenant: 'E6156'}).then(
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
    theOdo.create(d, {tenant: 'E6156'}).then(
        function(result) {
            logging.debug_message("testC result = ", result);
        })
        .catch(
            function(error) {
                logging.error_message("testC error = " + error);
            });
};

//fail
const testD = function() {

    let tmp = { id: "js12"}
    let fields = { customer: "Pending"}

    theOdo.update(tmp, fields, {tenant: 'E6156'}).then(
        function(result) {
            logging.debug_message("testD result = ", result);
        })
        .catch(
            function(error) {
                logging.error_message("testD error = " + error);
            });
};

//fail
const testE = function() {
    let tmp = { id: "js12"}

    theOdo.delete(tmp, {tenant: 'E6156'}).then(
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
    items: ['item1', 'item2'],
    totalPrice: 500
};

testA();
//testB();
//testC(test_create);
//testD()
//testE()
