/**
 * Created by donaldferguson on 8/26/18.
 */

const logging = require('../lib/logging');
const pdo =
    require('../resources/product/productdo');

let thePdo = new pdo.ProductDAO();

const testA = function() {
    thePdo.retrieveById(1, ['price', 'img_url'], {tenant: 'E6156'}).then(
        function(result) {
            logging.debug_message("testA result = ", result);
        })
        .catch(
            function(error) {
                logging.error_message("testA error = " + error);
            });
};

const testB = function() {
    thePdo.retrieveByTemplate({price: 12}, null, {tenant: 'E6156'}).then(
        function(result) {
            logging.debug_message("testB result = ", result);
        })
        .catch(
            function(error) {
                logging.error_message("testB error = " + error);
            });
};

const testC = function(d) {
    thePdo.create(d, {tenant: 'E6156'}).then(
        function(result) {
            logging.debug_message("testC result = ", result);
        })
        .catch(
            function(error) {
                logging.error_message("testC error = " + error);
            });
};


let test_create = {
    id: 10,
    name: 'aproduct',
    description: 'produc t d secription',
    category: 'food',
    price: 10,
    img_url: 'http://',
    modified: 0,
    tenant_id: 'E6156'
};

let test_create_fail = {
    id: 11,
    name: 'aproduct',
    description: 'produc t d secription',
    category: 'nonsense',
    price: 10,
    img_url: 'http://',
    modified: 0,
    tenant_id: 'E6156'
};

//testA();
//testB();
//testC(test_create);
testC(test_create_fail);
