/**
 * Adapted from test created by donaldferguson on 8/27/18.
 */

const logging = require('../lib/logging');
const Dao = require('../resources/DAO/dynamodao');

// Metadata that defines the collection.
let ordersCollection = {
    identity: 'E6156_orders',
    datastore: 'dynamo',
    primaryKey: 'customers_id', //actually the hash key
    rangeKey: 'id',

    attributes: {
        id: {type: 'string', required: true, columnName: 'id'},
        customer: {type: 'string', required: true, columnName: "customers_id"},
        items: {type: 'json', required: true, columnName: 'orders_items'},
        totalPrice: {type: 'number', required: true, columnName: 'orders_totalprice'},
        tenant_id: {type: 'string', required: true, columnName: 'tenant_id'}
    }
};

let testDao = new Dao.DynDao(ordersCollection);

//retrieve all fields by cust ID
const test1 = function() {
    testDao.retrieveById('js12',['id', 'createdAt', 'customers_id', 'orders_items', 'orders_totalprice', 'tenant_id']).then(
        function(rows) {
            logging.debug_message("Test 1 results = ", rows);
        })
        .catch(
            function(error) {
                logging.error_message("Test 1 error = ", error);
            });
};

//retrieve by template: should be error
const test2 = function() {
        let data = {
            id: "js12",
            customer: "js123",
            items: ["John", "Smith"],
            totalPrice: 123,
            tenant_id: "E6156"
        };

    testDao.retrieveByTemplate(data.customer, []).then(
        function(rows) {
            logging.debug_message("Test 2 results = ", rows);
            logging.debug_message("AeAAAAA");
        })
        .catch(
            function(error) {
                logging.error_message("Test 2 error = ", error);
                logging.debug_message("qAAAAAA");
            });
logging.debug_message("AAAAwAA");
};


//should show an insert
const test4 = function() {
    let data = {
        id: "js1234",
        customer: "js12",
        items: ["John", "Smith"],
        totalPrice: 123,
        tenant_id: "E6156"
    };
   testDao.create(data).then(
        function(rows) {
            logging.debug_message("Test 4 results = ");
            logging.debug_message(rows);
        })
        .catch(
            function(error) {
                logging.error_message("Test 4 error = ", error);
        });
};

//should throw an error
const test5 = function() {
    let data = {
        firstName: "Angus",
        email: "none",
        status: "ACTIVE",
    };
    testDao.update({ id: 'josm1' }, data).then(
        function(rows) {
            logging.debug_message("Test 5 results = " + rows);
        })
        .catch(
            function(error) {
                logging.error_message("Test 5 error = " + error);
            });
};

//should throw an error
const test6= function() {
    let tmp = {
        id: "Angus"
    };
    testDao.delete(tmp).then(
        function(rows) {
            logging.debug_message("Test 6 results = " + rows);
        })
        .catch(
            function(error) {
                logging.error_message("Test 6 error = " + error);
            });
};

//should throw an error
const test8= function() {
    q = "SELECT count(*) where customers_id like 'Ka%'";
    testDao.customQ(q).then(
        function(rows) {
            logging.debug_message("Test 8 results = " + rows);
        })
        .catch(
            function(error) {
                logging.error_message("Test 9 error = " + error);
            });
};

//should throw an error
const test7= function() {
    let tmp = {
        id: "Matt"
    };
    let fields = { items: [] }
    testDao.update(tmp, fields).then(
        function(rows) {
            logging.debug_message("Test 7 results = " + rows);
        })
        .catch(
            function(error) {
                logging.error_message("Test 7 error = " + error);
            });
};

const test9 = function() {
        let tmp = {
                id: "js1234",
                customer : "js12"
        }
        testDao.delete(tmp).then(
                function(rows) {
                    logging.debug_message("Test 9 results = " + rows);
                })
                .catch(
                    function(error) {
                        logging.error_message("Test 9 error = " + error);
                    });
}

const test10 = function() {
        let tmp = {
                id: "lm11",
                customer : "Messi"
        }
        let upda = {
                items: ['a', 'b', 'c']
        }
        testDao.update(tmp, upda).then(
                function(rows) {
                    logging.debug_message("Test 10 results = " + rows);
                })
                .catch(
                    function(error) {
                        logging.error_message("Test 10 error = " + error);
                    });
}


//@TODO: add more unit tests

//test1();
//test2();
//test4();
//test5();
//test6();
//test7();
//test8();
//test9();
test10();
