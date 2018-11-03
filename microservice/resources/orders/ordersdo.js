

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
        //created: autotimestameped by dynamo
    }
};



let OrdersDAO = function() {

    // Make a DAO and initialize with the collection metadata.
    this.theDao = new Dao.Dao(ordersCollection);
    let self = this;

    //column conversions, for dynamo
    self.columnToColumn2 = function(data) {
            var data2 = {}
            for (var attr in ordersCollection.attributes) {
                    if (data.hasOwnProperty(attr['columnName'])) {
                            data2[attr] = attr['columnName'];
                    }
            }
            if (data.hasOwnProperty('createdAt')) {
                    data2['created'] = data['createdAt']
            }
            return data2;
    }

    self.fieldToField = function(fields) {
            var fields2 = []
            for (var field in ordersCollection.attributes) {
                    if (fields.includes(field)) {
                            fields2.push(ordersCollection.attributes[field]['columnName'])
                    }
            }
            logging.debug_message(fields2)
            return fields2;
    }

    this.retrieveById = function(id, fields, context) {
        // This is where we introduce multi-tenancy for data access.\
        self.fieldToField(fields);
        return self.theDao.retrieveById(id, self.fieldToField(fields)).then(
        //return self.theDao.retrieveByTemplate(template, fields).then(
            function (result) {
                //@TODO: filter result for tenant
                var res2 = []
                for (var itm in result['Items']) {
                        if(context.tenant == itm['tenant_id'] ) {
                                res2.push(itm)
                        }
                }
                logging.debug_message("Result = ", result);
                return self.columnToColumn2(res2); //result;
            }
        ).catch(function(error) {
            logging.debug_message("OrdersDAO.retrieveById: error = ", error);
        });
    };

    // not useful for our business logic
    this.retrieveByTemplate = function(tmpl, fields, context) {
            throw "Not implemented";
    };

    this.create = function(data, context) {

        return new Promise(function (resolve, reject) {
            // Add tenant_id to template.
            data.tenant_id = context.tenant;

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

    // not necessary
    self.update = function(template, fields, context) {
             throw "Not implemented";
    };

    // not necessary
    self.delete = function(template, context) {
             throw "Not implemented";
    };

}


exports.OrdersDAO = OrdersDAO;
