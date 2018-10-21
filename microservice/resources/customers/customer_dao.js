
let logging = require('../../lib/logging');
let DAO = require('../DAO/dao');

// Metadata that defines the collection.
let customers_configuration = {
    identity: 'customers',
    datastore: 'default',
    primaryKey: 'id',

    attributes: {
        id: {type: 'string', required: true, columnName: 'id'},
        user_last_name: {type: 'string', required: true, columnName: "lastname"},
        user_first_name: {type: 'string', required: true, columnName: "firstname"},
        email: {type: 'string', required: true, columnName: "email"},
        status: {type: 'string', required: true, columnName: "status"},
        pw: {type: 'string', required: true, columnName: "hashed_password"},
        last_login: {type: 'number', required: true, columnName: "timestamp_last_login"},
        created: {type: 'number', required: true, columnName: "timestamp_created"},
        modified: {type: 'number', required: true, columnName: "timestamp_modified"},
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
        if (r.last_login) {
            r.last_login = new Date(r.last_login);
        }
    };
    return r;
};

// This kind of stinks. Waterline does not support TIMESTAMP and other MySQL data types.
let convertFromDate = function(r) {
    if (r != null) {
        if (r.timestamp_created) {
            r.timestamp_created = r.timestamp_created.getTime();
        };
        if (r.timestamp_modified) {
            r.timestamp_modified = r.timestamp_modified.getTime();
        };
        if (r.timestamp_modified) {
            r.timestamp_modified = r.timestamp_modified.getTime();
        }
    }
    return r;
};


let CustomerDAO = function(w_manager) {

    let self = this;
    self.base_dao = new DAO.DAO(w_manager);

    self.generateId = function(lastName, firstName) {
        let p1 = firstName.substr(0, 2);
        let p2 = lastName.substr(0, 2);
        // let p3 = String(Math.floor(Math.random() * 100));
        // let newId = p1 + p2 + p3;
        let newId = p1 + p2;
        return newId;
    };

    self.retrieveById = function(id,  fields) {

        // self is where we introduce multi-tenancy for data access.
        // Convert and ID lookup to a template look up and add tenant_id from the context.
        let template = {[customers_configuration.primaryKey]: id, status: {"!=": "DELETED"}};

        return new Promise(function(resolve, reject) {
            self.base_dao.retrieveByTemplate(template, fields).then(
                function (result) {
                    result = convertToDate(result[0]);
                    resolve(result);
                },
                function(error) {
                    logging.debug_message("CustomersDAO.retrieveById: error = ", error);
                    reject(error);
                }
            ).catch(function(exception) {
                logging.debug_message("CustomersDAO.retrieveById: exception = ", exception);
                reject(exception);
            });
        });
    };

    // Basically the same logic.
    self.retrieveByTemplate = function(tmpl, fields, context) {
        if (!tmpl.status) {
            tmpl.status = {"!=": "DELETED"}
        }

        return new Promise(function(resolve, reject) {
            self.base_dao.retrieveByTemplate(tmpl, fields).then(
                function(result) {
                    result = result.map(convertToDate);
                    resolve(result);
                },
                function(error) {
                    logging.debug_message("CustomersDAO.retrieveByTemplate: error = ", error);
                    reject(error);
                }
            ).catch(function(exception) {
                logging.debug_message("CustomersDAO.retrieveByTemplate: exception = ", exception);
                reject(exception);
            });
        });
    };

    // will be called when a customer registers
    self.create = function(data) {

        return new Promise(function (resolve, reject) {

            // Set created and modified.
            data.created = new Date();
            data.modified = new Date();
            data.last_login = new Date(0);
            data = convertToDate(data);
            data.id = self.generateId(data.user_last_name, data.user_first_name);
            self.base_dao.create(data).then(
                function (result) {
                    resolve(result);
                },
                function(error) {
                    logging.debug_message("CustomersDAO.create: Error = ", error);
                    reject(error);
            })
            .catch(function(exc) {
                logging.debug_message("CustomersDAO.create: Exception = " + exc);
                reject(exc);
            });
        });
    };
};


exports.CustomerDAO = CustomerDAO;
