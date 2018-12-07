/**
 * Created by donaldferguson on 8/27/18.
 */

const logging = require('../lib/logging');
const cbo = require('../resources/cart/cartbo');

let context = { tenant: "E6156"};

let testB1 = function() {
    cbo.retrieveById('sulu1', ['id'], context).then(
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

let test_update = {
    customer: 'sulu1',
    items: [4, 5]/*['item1', 'item2']*/
};

let testB2 = function(d) {
    cbo.addToCart(d, context).then(
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
//testB2(test_create);
testB2(test_update);
