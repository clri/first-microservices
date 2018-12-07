/**
 * Adapted from file created by donaldferguson on 8/16/18.
 */
let Waterline = require('waterline');
let dbAdaptor = require('sails-mysql');

let logging = require('../../lib/logging');         // Should replace with Winston or similar.
let env = require('../../env');                     // Simple config info based on an environment variable.
let return_codes = require('../return_codes');      // Application standardized RCs.

let environment_name = process.env.environment_name; 
logging.debug_message("environment_name = ", environment_name);

// Use the environment variable to get the information about DB conn based on environment.
let db_info = env.getEnv(environment_name)
logging.debug_message("s_env = ", db_info);

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


let customersCollection = {
    identity: 'customers',
    datastore: 'default',
    primaryKey: 'id',

    attributes: {
        id: {type: 'string', required: true, columnName: 'customers_id'},
        lastName: {type: 'string', required: true, columnName: "customers_lastname"},
        firstName: {type: 'string', required: true, columnName: "customers_firstname"},
        email: {type: 'string', required: true, columnName: "customers_email"},
        status: {type: 'string', required: true, columnName: 'customers_status'},
        pw: {type: 'string', required: true, columnName: 'customers_password'},
        address1: {type: 'string', required: false, allowNull: true, columnName: `customers_address_line1`},
        address2: {type: 'string', required: false, allowNull: true, columnName: `customers_address_line2`},
        city: {type: 'string', required: false, allowNull: true, columnName: `customers_city`},
        state: {type: 'string', required: false, allowNull: true, columnName: `customers_state`},
        zip: {type: 'string', required: false, allowNull: true, columnName: `customers_zip`},
        last_login: {type: 'number', required: true, columnName: 'customers_last_login'},
        created: {type: 'number', required: true, columnName: 'customers_created'},
        modified: {type: 'number', required: true, columnName: 'customers_modified'},
        tenant_id: {type: 'string', required: true, columnName: 'tenant_id'}
    }
};

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

let productCollection = {
    identity: 'product',
    datastore: 'default',
    primaryKey: 'id',

    attributes: {
        id: {type: 'number', required: true, columnName: 'product_id'},
        name: {type: 'string', required: true, columnName: "product_name"},
        description: {type: 'string', required: true, columnName: "product_description"},
        category: {type: 'string', required: true, columnName: "product_category"},
        price: {type: 'number', required: true, columnName: "product_price"},
        img_url: {type: 'string', required: true, columnName: 'product_image_url'},
        //created: {type: 'number', required: true, columnName: 'product_created'},
        modified: {type: 'number', required: true, columnName: 'product_modified'},
        tenant_id: {type: 'string', required: true, columnName: 'tenant_id'}
    }
};

let waterline = new Waterline();
let ontology = null;
let cacheOntology = function(o) {
    ontology = o;
    console.log("Cached Ontology: " + ontology);
}
let registerModels = function() {
    let known_collections = [customersCollection, productCollection];
    for(var i = 0; i < known_collections.length; i++) {
        var c = known_collections[i];
        var m = Waterline.Collection.extend(c);
        waterline.registerModel(m);
        console.log("Registering collection: ", c.identity);
    }
    waterline.initialize(global_config, function (err, result) {
        if (err) {
            logging.error_message("Error =", err);
            if(err.raw) {
                logging.error_message(err.raw);
            }
        }
        else {
            cacheOntology(result);
        }
    });
}
registerModels();

//
let getCollection =  function(id) {

    return new Promise(function(resolve, reject) {
        console.log("Ontology: ", ontology);
        console.log("Collections: ", ontology.collections);
        if(ontology.collections[id]) {
            resolve(ontology.collections[id]);    
        }
        else {
            var err = "Error = Collection " + id.toString() + " not found";
            logging.error_message();    
            reject(err);
        }
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
                logging.debug_message("Ontology: " + result);
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

    // registerCollection(this.collection);                // Register config information with Waterline.

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
