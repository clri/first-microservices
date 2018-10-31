

let logging = require('../../lib/logging');
//let Dao = require('../dao');
let Dao = require('../dynamoDAO')


// Metadata that defines the collection.
let ordersCollection = {
    identity: 'E6156_orders',
    datastore: 'dynamo',
    primaryKey: 'customers_id', //actually the hash key
    rangeKey: 'id',

    attributes: {
        id: {type: 'string', required: true, columnName: 'id'},
        customer: {type: 'string', required: true, columnName: "customers_id"},
        /*product: {type: 'number', required: true, columnName: "product_id"},
        quantity: {type: 'number', required: true, columnName: "orders_quantity"},*/
        items: {type: 'json', required: true, columnName: 'orders_items'},
        totalPrice: {type: 'number', required: true, columnName: 'orders_totalprice'},
        //tax: {type: 'number', required: true, columnName: 'orders_tax'},
        //shipping: {type: 'number', required: true, columnName: 'product_quantity_stocked'},
        tenant_id: {type: 'string', required: true, columnName: 'tenant_id'}
    }
};

// This kind of stinks. Waterline does not support TIMESTAMP and other MySQL data types.
let convertToDate = function(r) {
    if (r != null) {
        if (r.created) {
            r.created = new Date(r.created);
        };
    };
    return r;
};

// This kind of stinks. Waterline does not support TIMESTAMP and other MySQL data types.
let convertFromDate = function(r) {
    if (r != null) {
        if (r.created) {
            r.create = r.created.getTime();
        };
    }
    return r;
};


let OrdersDAO = function() {

    // Make a DAO and initialize with the collection metadata.
    this.theDao = new Dao.Dao(ordersCollection);
    let self = this;

    this.retrieveById = function(id,  fields, context) {

        // This is where we introduce multi-tenancy for data access.
        // Convert and ID lookup to a template look up and add tenant_id from the context.
        //let template = {[ordersCollection.primaryKey]: id, "tenant_id": context.tenant};

        return self.theDao.retrieveByID(id, fields).then(
        //return self.theDao.retrieveByTemplate(template, fields).then(
            function (result) {
                result = convertToDate(result[0]);                  //  Need to convert numeric dates to Date();
                logging.debug_message("Result = ", result);
                return result;
            }
        ).catch(function(error) {
            logging.debug_message("OrdersDAO.retrieveById: error = ", error);
        });
    };

    // Basically the same logic.
    this.retrieveByTemplate = function(tmpl, fields, context) {

        // Add tenant_id to template.
        tmpl.tenant_id = context.tenant;


        return self.theDao.retrieveByTemplate(tmpl, fields).then(
            function(result) {
                result = result.map(convertToDate);
                return result;
            }
        ).catch(function(error) {
            logging.debug_message("OrdersDAO.retrieveByTemplate: error = ", error);
        });
    };

    this.create = function(data, context) {

        return new Promise(function (resolve, reject) {
            // Add tenant_id to template.
            data.tenant_id = context.tenant;

            // Need to do two things here.
            // 1. Convert JavaScript dates to timestamps.
            // 2. Hash/Salt the password.

            // Set created and modified.
            data.created = new Date();
            data = convertToDate(data);

            self.theDao.create(data).then(
                function (result) {
                    if (result === undefined || result == null) {
                        result = {}
                    }
                    resolve(result);
                },
                function(error) {
                    logging.error_message("ordersDAO.create: Error = ", error);
                    reject(error);
                })
                .catch(function(exc) {
                    logging.error_message("ordersDAO.create: Exception = " + exc);
                    reject(exc);
                });
        });
    };

    // @TODO: Need to figure out how to handle return codes, e.g. not found.
    // Will have to get row_count or do a findByTemplateFirst.
    self.update = function(template, fields, context) {

        return new Promise(function (resolve, reject) {
            // Add tenant_id to template.

            template.tenant_id = context.tenant;

            self.theDao.update(template, fields).then(
                function (result) {
                    if (result === undefined || result == null) {
                        result = {}
                    }
                    resolve({});
                },
                function(error) {
                    logging.error_message("ordersdo.update: Error = ", error);
                    reject(error);
                })
                .catch(function(exc) {
                    logging.error_message("ordersdo.update: Exception = " + exc);
                    reject(exc);
                });
        });

    };

    // @TODO: Need to figure out how to handle return codes, e.g. not found.
    // Will have to get row_count or do a findByTemplateFirst.
    self.delete = function(template, context) {

        return new Promise(function (resolve, reject) {
            // Add tenant_id to template.
            template.tenant_id = context.tenant;

            self.update(template, data, context).then(
                function (result) {
                    if (result === undefined || result == null) {
                        result = {}
                    }
                    resolve({})
                },
                function(error) {
                    logging.error_message("ordersdo.delete: Error = ", error);
                    reject(error);
                })
                .catch(function(exc) {
                    logging.error_message("ordersdo.delete: Exception = " + exc);
                    reject(exc);
                });
        });

    };

}


exports.OrdersDAO = OrdersDAO;
