

let logging = require('../../lib/logging');
let Dao = require('../dao');


// Metadata that defines the collection.
let productCollection = {
    identity: 'product',
    datastore: 'default',
    primaryKey: 'id',

    attributes: {
        id: {type: 'number', required: true, columnName: 'product_id'},
        name: {type: 'string', required: true, columnName: "product_name"},
        description: {type: 'string', required: true, columnName: "product_description"},
        price: {type: 'number', required: true, columnName: "product_price"},
        markdown: {type: 'number', required: true, columnName: 'product_markdown'},
        stocked: {type: 'number', required: true, columnName: 'product_quantity_stocked'},
        url: {type: 'string', required: true, columnName: 'product_image_url'},
        status: {type: 'string', required: true, columnName: 'product_status'},
        created: {type: 'number', required: true, columnName: 'product_created'},
        modified: {type: 'number', required: true, columnName: 'product_modified'},
        tenant_id: {type: 'string', required: true, columnName: 'tenant_id'}
    }
};

// This kind of stinks. Waterline does not support TIMESTAMP and other MySQL data types.
let convertToDate = function(r) {
    if (r != null) {
        if (r.created) {
            r.created = new Date(r.created);
        };
        if (r.modified) {
            r.modified = new Date(r.modified);
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
        if (r.modified) {
            r.modified = r.modified.getTime();
        };
    }
    return r;
};


let ProductDAO = function() {

    // Make a DAO and initialize with the collection metadata.
    this.theDao = new Dao.Dao(productCollection);
    let self = this;

    this.retrieveById = function(id,  fields, context) {

        // This is where we introduce multi-tenancy for data access.
        // Convert and ID lookup to a template look up and add tenant_id from the context.
        let template = {[productCollection.primaryKey]: id, "tenant_id": context.tenant,
            status: {"!=": "DELETED"}};

        return self.theDao.retrieveByTemplate(template, fields).then(
            function (result) {
                result = convertToDate(result[0]);                  //  Need to convert numeric dates to Date();
                //logging.debug_message("Result = ", result);
                return result;
            }
        ).catch(function(error) {
            logging.debug_message("ProductDAO.retrieveById: error = ", error);
        });
    };

    // Basically the same logic.
    this.retrieveByTemplate = function(tmpl, fields, context) {

        // Add tenant_id to template.
        tmpl.tenant_id = context.tenant;

        if (!tmpl.status) {
            tmpl.status = {"!=": "DELETED"}
        }

        return self.theDao.retrieveByTemplate(tmpl, fields).then(
            function(result) {
                result = result.map(convertToDate);
                return result;
            }
        ).catch(function(error) {
            logging.debug_message("ProductDAO.retrieveByTemplate: error = ", error);
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
            data.modified = new Date();
            data = convertToDate(data);

            self.theDao.create(data).then(
                function (result) {
                    if (result === undefined || result == null) {
                        result = {}
                    }
                    resolve(result);
                },
                function(error) {
                    logging.error_message("productDAO.create: Error = ", error);
                    reject(error);
                })
                .catch(function(exc) {
                    logging.error_message("productDAO.create: Exception = " + exc);
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
            template.status = {"!=": "DELETED"}

            self.theDao.update(template, fields).then(
                function (result) {
                    if (result === undefined || result == null) {
                        result = {}
                    }
                    resolve({});
                },
                function(error) {
                    logging.error_message("productdo.update: Error = ", error);
                    reject(error);
                })
                .catch(function(exc) {
                    logging.error_message("productdo.update: Exception = " + exc);
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

            let data = { status: "DELETED"};

            self.update(template, data, context).then(
                function (result) {
                    if (result === undefined || result == null) {
                        result = {}
                    }
                    resolve({})
                },
                function(error) {
                    logging.error_message("productdo.delete: Error = ", error);
                    reject(error);
                })
                .catch(function(exc) {
                    logging.error_message("productdo.delete: Exception = " + exc);
                    reject(exc);
                });
        });

    };

}


exports.ProductDAO = ProductDAO;
