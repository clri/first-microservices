/*
dynamodao.js: created by Caroline Roig-Irwin 10/28/18
DAO, but for dynamo

*/
let logging = require('../../lib/logging');
let return_codes = require('../return_codes');
let Joi = require('joi');
let dynogels = require('dynogels-promisified');
let env = require('../../env');

dynogels.AWS.config.update(env.getDyn());


// A collection is how Waterline says "Table."
// We are registering the metadata on the table.
let registerCollection = function(c) {
    //convert attributes
    var attrs = {};
    for (var attr in c.attributes) {
            var cname = c.attributes[attr]['columnName'];
            var ctype = c.attributes[attr]['type'];

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
           rangeKey : c.rangeKey,
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

    //helper function to convert column names
    self.columnToColumn = function(data) {
            var data2 = {}
            for (var attr in data) {
                    var cname = this.collection.attributes[attr]['columnName'];
                    data2[cname] = data[attr];
            }
            return data2;
    }

    // Retrieve by a single column, primary (hash) key.
    self.retrieveById = function(id, fields) {
        return new Promise(function(resolve, reject) {

            self.table.query(id).attributes(fields).loadAll().execAsync().then(
                function(res) {
                    if (res) {
                        logging.debug_message("DyDao.retrieve_by_id: noerror  = " + res);
                        resolve(res);
                    }
                    else {
                        resolve([]);
                    }
                },
                function (err) {
                    logging.debug_message("DyDao.retrieve_by_id: error  = " + err);
                    reject(err);
            });

        });
    };

    // retrieveByTemplate: it's hard to chain filters together when we don't
    // know how many there are, and we don't need to implement the business
    // logic for a feature we don't need. Thus, we'll leave this in if only
    // to throw an error.
    self.retrieveByTemplate = function(template, fields) {
            throw "Not implemented.";
    };

    //we won't implement this yet either, unless we need to update orders
    //(shipping address, payment method, etc is not handled in this db)
    self.update = function(template, updates) {
            throw "Not implemented.";
    };

    //and we won't delete orders; we need the history
    self.delete = function(template) {
            throw "Not implemented.";
    };


    self.create = function(data) {

        //map attributes to correct columns
        logging.debug_message("column to columning");
        var data2 = this.columnToColumn(data);
        logging.debug_message("Eh")
        /*{}
        for (var attr in data) {
                var cname = self.collection.attributes[attr]['columnName'];
                data2[cname] = data[attr];
        }*/
        logging.debug_message(data2);
        var that = this;

        return new Promise(function(resolve, reject) {
            that.table.createAsync(data2).then(
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
    };

};



exports.DynDao = DynDao;
