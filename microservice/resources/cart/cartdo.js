

let logging = require('../../lib/logging');
//let Dao = require('../dao');
let Dao = require('../DAO/dynamodao')


// Metadata that defines the collection.
let cartCollection = {
    identity: 'E6156_cart',
    datastore: 'dynamo',
    primaryKey: 'customers_id', //actually the hash key
    rangeKey: 'id',

    attributes: {
        id: {type: 'string', required: true, columnName: 'id'},
        customer: {type: 'string', required: true, columnName: "customers_id"},
        items: {type: 'json', required: true, columnName: 'cart_items'},
        tenant_id: {type: 'string', required: true, columnName: 'tenant_id'}
    }
};



let CartDAO = function() {

    // Make a DAO and initialize with the collection metadata.
    this.theDao = new Dao.DynDao(cartCollection);
    let self = this;

    //column conversions, for dynamo
    self.columnToColumn2 = function(data) {
            var data2 = {}
            //logging.debug_message(data);
            for (var attr in cartCollection.attributes) {
                    if (data.hasOwnProperty(cartCollection.attributes[attr]['columnName'])) {
                            data2[attr] = data[cartCollection.attributes[attr]['columnName']];
                    }
            }
            if (data.hasOwnProperty('createdAt')) {
                    data2['created'] = data['createdAt']
            }
            logging.debug_message(data2);
            return data2;
    }

    self.columnToColumn = function(data) {
            var data2 = {}
            //logging.debug_message(data);
            for (var attr in cartCollection.attributes) {
                    if (data.hasOwnProperty(attr)) {
                            data2[cartCollection.attributes[attr]['columnName']] = data[attr]
                    }
            }
            logging.debug_message(data2);
            return data2;
    }

    self.fieldToField = function(fields) {
            var fields2 = []
            for (var field in cartCollection.attributes) {
                    if (fields.includes(field)) {
                            fields2.push(cartCollection.attributes[field]['columnName'])
                    }
            }
            if (fields.includes('created')) {
                    fields2.push('createdAt')
            }
            //logging.debug_message(fields2)
            return fields2;
    }

    this.retrieveById = function(id, fields, context) {
        // This is where we introduce multi-tenancy for data access.\
        newFields = self.fieldToField(fields);
        if (fields.includes('tenant_id') == false) {
                newFields.push('tenant_id')
        }
        logging.debug_message(newFields);
        return self.theDao.retrieveById(id, newFields).then(
            function (result) {
                //@TODO: filter result for tenant
                var res2 = []
                for (var itmno in result['Items']) {
                        var itm = result['Items'][itmno]['attrs']
                        //logging.debug_message(itm);
                        //logging.debug_message('asdlkfj');
                        if(context.tenant == itm['tenant_id'] ) {
                                if (fields.includes('tenant_id') == false) {
                                        delete itm['tenant_id'];
                                }
                                res2.push(self.columnToColumn2(itm));
                        }
                }
                //logging.debug_message("Result = ", result);
                logging.debug_message("Result2 = ", res2);
                return res2;
            }
        ).catch(function(error) {
            logging.debug_message("CartDAO.retrieveById: error = ", error);
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
                    logging.error_message("cartDAO.create: Error = ", error);
                    reject(error);
                })
                .catch(function(exc) {
                    logging.error_message("cartDAO.create: Exception = " + exc);
                    reject(exc);
                });
        });
    };

    // MUST IMPLEMENT THIS
    self.update = function(template, fields, context) {
            return new Promise(function (resolve, reject) {
                // Add tenant_id to template.
                template.tenant_id = context.tenant;
                self.theDao.update(self.columnToColumn(template), self.columnToColumn(fields)).then(
                        function(res) {
                                logging.debug_message("CART UPDATE" + res);

                        }, function(err) {
                                logging.debug_message(err);
                        })

        })
             //throw "Not implemented";
    };

    // MUST IMPLEMENT THIS
    self.delete = function(template, context) {
            return new Promise(function (resolve, reject) {
                // Add tenant_id to template.
                template.tenant_id = context.tenant;
                self.theDao.delete(self.columnToColumn(template)).then(
                        function(res) {
                                logging.debug_message("CART DELETE" + res);

                        }, function(err) {
                                logging.debug_message(err);
                        })

        })
    };

}


exports.CartDAO = CartDAO;
