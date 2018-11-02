let redis = require('redis');
let bluebird = require('bluebird');
bluebird.promisifyAll(redis);


// used for password reset tokens
exports.init0 = function() {
	rclient = redis.createClient('redis://127.0.0.1:6379/0');
	rclient.on("ready", function() {
		console.log("redis client(0) ready!");
	});
	return rclient;
}


// used for email activation tokens
exports.init1 = function() {
	rclient = redis.createClient('redis://127.0.0.1:6379/1');
	rclient.on("ready", function() {
		console.log("redis client(1) ready!");
	});
	return rclient;
}