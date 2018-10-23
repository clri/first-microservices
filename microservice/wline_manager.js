let Waterline = require('waterline');
let db_adaptor = require('sails-mysql');
let logging = require('./lib/logging');
let env = require('./env');
let sleep = require('sleep');

let db_info = env.getEnv("beanstalk");
console.log(db_info);


// Metadata that defines the collection.
let customers_configuration = {
    identity: 'customers',
    datastore: 'default',
    primaryKey: 'id',

    attributes: {
        id: {type: 'string', required: true, columnName: 'customers_id'},
        user_last_name: {type: 'string', required: true, columnName: "customers_lastname"},
        user_first_name: {type: 'string', required: true, columnName: "customers_firstname"},
        email: {type: 'string', required: true, columnName: "customers_email"},
        status: {type: 'string', required: true, columnName: "customers_status"},
        pw: {type: 'string', required: true, columnName: "customers_password"},
        last_login: {type: 'number', required: true, columnName: "customers_last_login"},
        created: {type: 'number', required: true, columnName: "customers_created"},
        modified: {type: 'number', required: true, columnName: "customers_modified"},
    }
};


// DB specific information, no table specific information
let global_config = {
    adapters: {
        'db': db_adaptor
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

// this object should be initialized once only, so, it's not exported
let singleton_manager = function() {

	let self = this;
	self.waterline = new Waterline();
	self.ontology = null;


	this.initialize = function(callback) {
		self.waterline.initialize(global_config, function (err, result) {
		    if (err) {
		        logging.error_message("Error =", err);
		    }
		    else {
		        callback(result);
		    }
		});
	};

	this.getCollection =  function(id) {
	    return self.ontology.collections[id];
	};
	registerCollection = function(configuration) {
	    let wCollection = Waterline.Collection.extend(configuration);
	    self.waterline.registerModel(wCollection);
	};


	registerCollection(customers_configuration);


}

exports.singleton_manager = singleton_manager;
