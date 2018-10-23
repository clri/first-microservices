let logging = require('../../lib/logging');

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

// let Waterline = require('waterline');
// let db_adaptor = require('sails-mysql');

// let waterline = new Waterline();
// let ontology = null;

// // Waterline config
// let global_config = {
//     adapters: {
//         'db': dbAdaptor
//     },
//     datastores: {
//         default: {
//             host: db_info.host,
//             port: db_info.port,
//             adapter: 'db',
//             url: db_info.url
//         }
//     }
// };


// // A collection is how Waterline says "Table."
// // We are registering the metadata on the table.
// let registerCollection = function(configuration) {
//     let wCollection = Waterline.Collection.extend(configuration);
//     waterline.registerModel(wCollection);
// };


// // You need the Ontology to get the collection to perform an operation.
// // self MAY talk to the DB engine and Waterline, and hence can go asynchronous.
// // Ontology is an off word to use.
// //
// let getOntology = function() {
//     "use strict";                                           // Not sure how important self "strict" stuff is.
//     return new Promise(function (resolve, reject) {
//         if (ontology) {                                     // Have I retrieved and cached the ontology?
//             //logging.debug_message("getOntology1: " + ontology);
//             resolve(ontology);
//         }
//         else {
//             // Ontology uses callbacks. Call initialize and resolve Promise based on the response.
//             waterline.initialize(global_config, function (err, result) {
//                 if (err) {
//                     logging.error_message("Error =", err);
//                     reject(err);
//                 }
//                 else {
//                     //logging.debug_message("Setting ontology = ", null);
//                     ontology = result;
//                     resolve(ontology);
//                 }
//             });
//         }
//     });
// };

// // Given the name (identity) of a collection that represents a table, return it.
// // self may go asynch.
// //
// // @TODO: move to DAO class (getbyQ, etc as well)
// let getCollection =  function(id) {

//     return new Promise(function(resolve, reject) {
//         getOntology(global_config).then(
//             function (result) {
//                 "use strict";
//                 //console.log("Collection identity = " + id);
//                 resolve(result.collections[id]);
//             },
//             function (err) {
//                 "use strict";
//                 logging.error_message("Error = " + err);
//                 reject(err);
//             });
//     });
// };


// // 1. id is the identity of the collection, aka database table.
// // 2. q is a Waterline format of a query, which is primarily a dictionary of column names and values to match.
// // 3. fields is the list of fields, e.g. project, to return.
// //
// let getByQ = function(id, q, fields) {
//     return new Promise(function (resolve, reject) {
//         getCollection(id).then(
//             function (result) {
//                 if (fields) {
//                     resolve(result.find({"where": q, "select": fields}));
//                 }
//                 else {
//                     resolve(result.find({"where": q}));
//                 }
//             },
//             function (error) {
//                 reject(error)
//             });
//     });
// };

// // 1. id is the table name.
// // 2. d is the dictionary of (column_name, value) pairs to insert.
// //
// let create = function(id, d) {
//     return new Promise(function (resolve, reject) {
//         getCollection(id).then(
//             function (result) {
//                 resolve(result.create(d));
//             },
//             function (error) {
//                 reject(error)
//             })
//             .catch(function(exc) {
//                 logging.debug_message("exc = " + exc);
//                 reject(exc);
//             });
//     });
// };


// I want to isolate high layer, external code from the fact that the underlying DB is MySQL.
// self module maps MySQL specific error codes to a generic set that all DAOs will implement,
// // independently of the underlying database engine.
// //
// // Obviously, I have not rigorously figured out the DAO exceptions, the MySQL errors and the mapping.
// // But, you get the idea.
// //
// let mapError = function(e) {

//     let mapped_error = {};

//     switch(e.code) {

//         case "E_UNIQUE": {
//             mapped_error = return_codes.codes.uniqueness_violation;
//             break;
//         }
//         //@TODO: add more errors (required field not included, length overflow, etc)

//         default: {
//             mapped_error = return_codes.codes.unknown_error;
//             break;
//         }

//     }

//     return mapped_error;
// };


// Generic DAO for a table/document
let DAO = function(w_manager) {
    self = this;
    self.w_manager = w_manager;
    console.log(w_manager);
    self.getByQ = function(q, fields) {
        return new Promise(function (resolve, reject) {
            collection = self.w_manager.getCollection(customers_configuration.identity);
            if(fields) {
                resolve(collection.find({"where": q, "select": fields}));
            }
            else {
                resolve(collection.find({"where": q}));
            }
        });
    };

    self.retrieveById = function(id, fields) {
        return new Promise(function(resolve, reject) {
            s =  self.configuration.primaryKey;

            self.getByQ({[s]: id}).then(
                function (result) {
                    if (result && result[0]) {
                        resolve(result[0])
                    }
                    else {
                        // no result => invalid login
                        reject([]);
                    }
                },
                function (error) {
                    logging.debug_message("DAO.retrieve_by_id: error  = " + error);
                    reject(error);
                }
            );
        });
    };

    self.retrieveByTemplate = function(template, fields) {
        return new Promise(function(resolve, reject) {
            self.getByQ(template, fields).then(
                function (result) {
                    if (result) {
                        resolve(result);
                    }
                    else {
                        resolve([]);
                    }
                },
                function (error) {
                    logging.debug_message("Boom2 = " + error);
                    reject(error);
                }
            )
        });
    };

    self.create = function(data) {
        return new Promise(function(resolve, reject) {
            collection = self.w_manager.getCollection(customers_configuration.identity);
            console.log(data);
            collection.create(data).fetch().then(
                function(result) {
                    resolve(result);
                },
                function(error) {
                    logging.debug_message("DAO.create waterline.ferch error: ", error);
                    reject(error);
                }
            )
            .catch(function(exc) {
                reject(exc);
            });
        });
    };
};



exports.DAO = DAO;
