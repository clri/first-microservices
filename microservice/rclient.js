let redis = require('redis');
let bluebird = require('bluebird');
bluebird.promisifyAll(redis);


// used for password reset tokens
exports.init0 = function() {
    rclient = redis.createClient('redis://:kpjqjyxa61e4iGbUNr9y6brMoRbFNa6r@redis-11638.c114.us-east-1-4.ec2.cloud.redislabs.com:11638/0');
    //rclient = redis.createClient('redis://127.0.0.1:6379/0');

    rclient.on("ready", function() {
        console.log("redis client(0) ready!");
    });
    return rclient;
}


// used for email activation tokens
exports.init1 = function() {
    rclient = redis.createClient('redis://:U8kcW9WiUsEeNUx600S3kHHE2fX9KO3u@redis-10417.c100.us-east-1-4.ec2.cloud.redislabs.com:10417/0');
    //rclient = redis.createClient('redis://127.0.0.1:6379/1');
    rclient.on("ready", function() {
	console.log("redis client(1) ready!");
    });
    return rclient;
}
