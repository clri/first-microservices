/**
 * Adapted from file created by donaldferguson on 8/16/18.
 */

// NPM packages for Waterline and connection to MySQL
let Waterline = require('waterline');
let dbAdaptor = require('sails-mysql');

// Simple utility packages that I use.
let logging = require('../../lib/logging');         // Should replace with Winston or similar.
let env = require('../../env');                     // Simple config info based on an environment variable.
let return_codes = require('../return_codes');      // Application standardized RCs.

// Ad hoc approach to getting information based on running local, beanstalk, etc.
// eb2_environment is the name of the environment variable.
let environment_name = 'beanstalk'; //process.env.eb2_environment; @TODO: set this up
logging.debug_message("environment_name = ", environment_name);

// Use the environment variable to get the information about DB conn based on environment.
let db_info = env.getEnv(environment_name)
logging.debug_message("s_env = ", db_info);


let waterline = new Waterline();
// Ontology = DB info
let ontology = null;

// Waterline config
let global_config = {
    adapters: {
        'db': dbAdaptor
    },
    datastores: {
        default: {
            host: db_info.host,
            port: db_info.port,
            adapter: 'db',
            url: db_info.url
        }
    }
};


// A collection is how Waterline says "Table."
// We are registering the metadata on the table.
let registerCollection = function(c) {
    let wCollection = Waterline.Collection.extend(c);
    waterline.registerModel(wCollection);
};


// You need the Ontology to get the collection to perform an operation.
// This MAY talk to the DB engine and Waterline, and hence can go asynchronous.
// Ontology is an off word to use.
//
let getOntology = function() {
    "use strict";                                           // Not sure how important this "strict" stuff is.
    return new Promise(function (resolve, reject) {
        if (ontology) {                                     // Have I retrieved and cached the ontology?
            //logging.debug_message("getOntology1: " + ontology);
            resolve(ontology);
        }
        else {
            // Ontology uses callbacks. Call initialize and resolve Promise based on the response.
            waterline.initialize(global_config, function (err, result) {
                if (err) {
                    logging.error_message("Error =", err);
                    reject(err);
                }
                else {
                    //logging.debug_message("Setting ontology = ", null);
                    ontology = result;
                    resolve(ontology);
                }
            });
        }
    });
};

// Given the name (identity) of a collection that represents a table, return it.
// This may go asynch.
//
// @TODO: move to DAO class (getbyQ, etc as well)
let getCollection =  function(id) {

    return new Promise(function(resolve, reject) {
        getOntology(global_config).then(
            function (result) {
                "use strict";
                //console.log("Collection identity = " + id);
                resolve(result.collections[id]);
            },
            function (err) {
                "use strict";
                logging.error_message("Error = " + err);
                reject(err);
            });
    });
};


// 1. id is the identity of the collection, aka database table.
// 2. q is a Waterline format of a query, which is primarily a dictionary of column names and values to match.
// 3. fields is the list of fields, e.g. project, to return.
//
let getByQ = function(id, q, fields) {
    return new Promise(function (resolve, reject) {
        getCollection(id).then(
            function (result) {
                logging.debug_message(result);
                if (fields) {
                    resolve(result.find({"where": q, "select": fields}));
                }
                else {
                    resolve(result.find({"where": q}));
                }
            },
            function (error) {
                reject(error)
            });
    });
};

// 1. id is the table name.
// 2. d is the dictionary of (column_name, value) pairs to insert.
//
let create = function(id, d) {
    return new Promise(function (resolve, reject) {
        getCollection(id).then(
            function (result) {
                resolve(result.create(d));
            },
            function (error) {
                reject(error)
            })
            .catch(function(exc) {
                logging.debug_message("exc = " + exc);
                reject(exc);
            });
    });
};


// I want to isolate high layer, external code from the fact that the underlying DB is MySQL.
// This module maps MySQL specific error codes to a generic set that all DAOs will implement,
// independently of the underlying database engine.
//
// Obviously, I have not rigorously figured out the DAO exceptions, the MySQL errors and the mapping.
// But, you get the idea.
//
let mapError = function(e) {

    let mapped_error = {};

    switch(e.code) {

        case "E_UNIQUE": {
            mapped_error = return_codes.codes.uniqueness_violation;
            break;
        }
        //@TODO: add more errors (required field not included, length overflow, etc)

        default: {
            mapped_error = return_codes.codes.unknown_error;
            break;
        }

    }

    return mapped_error;
};


// Generic class for accessing a table in MySQL.
let Dao = function(collection) {

    self = this;                                        // JavaScript "this" can act weird.

    self.collection = collection;                       // Configuration information.

    registerCollection(this.collection);                // Register config information with Waterline.

    // Retrieve by a single column, primary key.
    // Probably should add support for multi-column primary keys.
    self.retrieveById = function(id, fields) {
        return new Promise(function(resolve, reject) {
            s = self.collection.primaryKey;

            getByQ(self.collection.identity, {[s]: id}).then(
                function (result) {
                    if (result && result[0]) {
                        // Queries always return an array, but primary key is unique.
                        resolve(result[0])
                    }
                    else {
                        // This is a mistake. [] is the correct answer for general queries, but
                        // should be "not found" for a primary key lookup.
                        resolve([]);
                    }
                },
                function (error) {
                    logging.debug_message("Dao.retrieve_by_id: error  = " + error);
                    reject(error);
                }
            );
        });
    };

    // A template is a dictionary of the form (column_name: values). This function returns
    // all of the rows that match the template.
    //
    // @TODO: Add support for pagination!
    //
    self.retrieveByTemplate = function(template, fields) {
        s = self.collection.primaryKey;
        return new Promise(function(resolve, reject) {
            getByQ(self.collection.identity, template, fields).then(
                function (result) {
                    if (result) {
                            logging.debug_message(result);
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

    //@TODO: test functionality
    self.update = function(template, updates) {

        return new Promise(function (resolve, reject) {
            getCollection(self.collection.identity).then(
                function (result) {
                    result.update(template, updates).then(
                        function (result) {
                            resolve(result);
                        },
                        function (error) {
                            logging.error_message("dao.Dao.updfate: error = ", error);
                            reject(error);
                        });
                },
                function (error) {
                    logging.error_message("dao.Dao.update: error = ", error);
                    reject(error)
                });
        });
    };

    //@TODO: test functionality
    self.delete = function(template) {
        return new Promise(function (resolve, reject) {
            getCollection(self.collection.identity).then(
                function (result) {
                    result.destroy(template).then(
                        function (result) {
                            resolve(result);
                        },
                        function (error) {
                            logging.error_message("dao.Dao.delete: error = ", error);
                            reject(error);
                        });
                },
                function (error) {
                    logging.error_message("dao.Dao.update: delete = ", error);
                    reject(error)
                });
        });
    };

    //@TODO: test functionality
    //return something so we can unit test it I guess?
    self.create = function(data) {
        return new Promise(function(resolve, reject) {
            create(self.collection.identity, data).then(
                function (result) {
                    resolve(result)
                },
                function (error) {
                    let new_error = mapError(error);
                    logging.debug_message("Boom = ", new_error);
                    reject(new_error);
                }
            );
        });
    };

    // This would push a custom query into the DB, but Waterline makes this really hard.
    //@TODO: do we need custom queries? look into this
    self.customQ = function(q) {
            throw "Not implemented.";
       //reject("Not implemented.");
    };

};



exports.Dao = Dao;
