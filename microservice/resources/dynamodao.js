/*
dynamodao.js: created by Caroline Roig-Irwin 10/28/18
DAO, but for dynamo

*/
let logging = require('../lib/logging');
let return_codes = require('./return_codes');
let Joi = require('joi');
let dynogels = require('dynogels-promisified');

dynogels.AWS.config.update(
        { accessKeyId: process.env.aws_access_key_id,
          secretAccessKey: process.env.aws_secret_access_key,
          region: "us-east-1" });

let makeCollection = function(c) {

}


// A collection is how Waterline says "Table."
// We are registering the metadata on the table.
let registerCollection = function(c) {
    //convert attributes
    var attrs = {};
    for (var attr in c.attributes) {
            var cname = c.attributes[attr]['columnName'];
            var ctype = c.attributes[attr]['type'];
            //logging.debug_message(cname + " " + ctype);
            //logging.debug_message(ctype == "string");

            //@TODO: make this control flow better, possibly add other cases
            if (ctype == "string") {
                    attrs[cname] = Joi.string();
            }
            if (ctype == "json") {
                    attrs[cname] = dynogels.types.stringSet();
            }
            if (ctype == "number") {
                    attrs[cname] = Joi.number()
            }
    }

    //logging.debug_message(c.identity);
    return dynogels.define(c.identity, {
           hashKey : c.primaryKey,
           timestamps : true,
           schema : attrs,
           tableName : c.identity
   });

};



/*the key for dynamoDAO is that it has a common interface with the MySQL DAO
 *but under the hood it acts differently*/

let DynDao = function(collection) {

    self = this;
    self.collection = collection;

    self.table = registerCollection(this.collection);

    // Retrieve by a single column, primary key.
    self.retrieveById = function(id, fields) {
        return new Promise(function(resolve, reject) {

            self.table.getAsync(id).then(
                function(res) {
                    if (res) {
                        logging.debug_message("Dao.retrieve_by_id: noerror  = " + res);
                        resolve(res);
                    }
                    else {
                        resolve([]);
                    }
                },
                function (err) {
                    logging.debug_message("Dao.retrieve_by_id: error  = " + err);
                    reject(err);
            });

        });
    };
/*

    // @TODO: Add support for pagination!
    //
    self.retrieveByTemplate = function(template, fields) {
        s = self.collection.primaryKey;
        return new Promise(function(resolve, reject) {
            getByQ(self.collection.identity, template, fields).then(
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
                            logging.error_message("dao.Dao.update: error = ", error);
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
};*/

    //@TODO: test functionality
    //return something so we can unit test it I guess?
    self.create = function(data) {
        //@TODO: make sure all required attributes are there
        //map attributes to correct columns
        data2 = {}
        for (var attr in data) {
                var cname = self.collection.attributes[attr]['columnName'];
                data2[cname] = data[attr];
        }
        logging.debug_message(data2);

        return new Promise(function(resolve, reject) {
            self.table.createAsync(data2).then(
                function (result) {
                    resolve(result)
                },
                function (error) {
                    let new_error = error;
                    logging.debug_message("BoomBloom = ", new_error);
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



exports.Dao = DynDao;
