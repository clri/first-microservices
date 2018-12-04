/**
 * Created by donaldferguson on 8/27/18.
 */

const logging = require('../lib/logging');
const cbo = require('../resources/customers/customersbo');

let context = { tenant: "E6156"};

let testB1 = function() {
    cbo.retrieveById('dd1', ['lastName', 'firstName', 'email'], context).then(
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
    lastName: "Luis",
    firstName: 'Suarez',
    email: 'luiss@fcp.es',
    status: 'PENDING',
    pw: "cool"
};

let testB2 = function(d) {
    cbo.create(d, context).then(
        function(result) {
            logging.debug_message("result = ", result);
        })
        .catch(
            function(error) {
                logging.error_message("error = " + error);
            }
        );
};

let test_address = {
        address1: '434 w 162 st',
        address2: '',
        city: 'New york',
        state: 'ny',
        zip: '10032'
}

let testC = function(a) {
        cbo.setAddress('sulu1', a.address1, a.address2, a.city, a.state, a.zip, context).then(
                function(result) {
                    logging.debug_message("result = ", result);
                })
                .catch(
                    function(error) {
                        logging.error_message("error = " + error);
                    }
                );

}

let testD = function() {
        cbo.getAddress('sulu1', context).then(
                function(result) {
                    logging.debug_message("result = ", result);
                })
                .catch(
                    function(error) {
                        logging.error_message("error = " + error);
                    }
                );
}

//testB1();
//testB2(test_create);
//testC(test_address);
testD();
