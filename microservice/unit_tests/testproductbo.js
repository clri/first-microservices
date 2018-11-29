/**
 * Created by donaldferguson on 8/27/18.
 */

const logging = require('../lib/logging');
const pbo = require('../resources/product/productbo');

let context = { tenant: "E6156"};
let context2 = { tenant: "E6156", adminOperation: 1};

let testB1 = function() {
    pbo.retrieveById(1, ['img_url', 'name'], context).then(
        function(result) {
            logging.debug_message("result = ", result);
        })
        .catch(
            function(error) {
                logging.error_message("error = " + error);
            }
        );
};

let test_create = {
    id: 15,
    name: 'aproduct2',
    description: 'produc t d secription',
    category: 'food',
    price: 15,
    img_url: 'http://',
    modified: 0,
    tenant_id: 'E6156'
};

let testB2 = function(d) {
    pbo.create(d, context).then(
        function(result) {
            logging.debug_message("result = ", result);
        })
        .catch(
            function(error) {
                logging.error_message("error = " + error);
            }
        );
};

let testB2A = function(d) {
    pbo.create(d, context2).then(
        function(result) {
            logging.debug_message("result = ", result);
        })
        .catch(
            function(error) {
                logging.error_message("error = " + error);
            }
        );
};

let testB3 = function() {
    pbo.retrieveByCategory('food', ['*'], context).then(
        function(result) {
            logging.debug_message("result = ", result);
        })
        .catch(
            function(error) {
                logging.error_message("error = " + error);
            }
        );
};

//testB1();
//testB2(test_create); //rejected since you aren't admin
//testB2A(test_create);
testB3();
