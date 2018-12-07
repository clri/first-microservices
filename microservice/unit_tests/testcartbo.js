/**
 * Created by donaldferguson on 8/27/18.
 */

const logging = require('../lib/logging');
const obo = require('../resources/orders/ordersbo');

let context = { tenant: "E6156"};

let testB1 = function() {
    obo.retrieveById('sulu1', ['id'], context).then(
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
    customer: 'sulu1',
    items: [1, 2]/*['item1', 'item2']*/
};

let testB2 = function(d) {
    obo.create(d, context).then(
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
testB2(test_create);
