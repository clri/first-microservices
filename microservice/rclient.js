let redis = require('redis');
let bluebird = require('bluebird');
bluebird.promisifyAll(redis);

exports.init = function() {
	rclient = redis.createClient('redis://127.0.0.1:6379/0');
	rclient.on("ready", function() {
		console.log("redis client ready!");
	});
	return rclient;
}