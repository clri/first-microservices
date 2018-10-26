let logging = require('../../lib/logging');

let insert_reset_token = function(rclient, token, cid) {
	return new Promise(function(resolve, reject){
		rclient.setAsync(token, cid, 'EX', 86400).then( 
			function(success) {
				console.log("insert_reset_token (success): ", token.toString() + " : " + cid.toString());
				resolve("insert_reset_token (success): ", token.toString() + " : " + cid.toString());
			},
			function(error) {
				console.log("insert_reset_token (error): ", error);
				reject("insert_reset_token (error): ", error);
			}
		).catch(function(exc) {
			console.log("passreset.insert_reset_token (exception): ", exc);
			reject("passreset.insert_reset_token (exception): ", exc);
		});
	});
};

let get_cid = function(rclient, token) {
	return new Promise(function(resolve, reject) {
		rclient.getAsync(token).then(
			function(success) {
				console.log("get_by_cid (success): ", token);
				resolve(success);
			},
			function(error) {
				console.log("get_by_cid (error): ", error);
				reject("get_by_cid (error): ", error);
			}
		).catch(function(exc) {
			console.log("get_by_cid (exception): ", exc);
			reject("get_by_cid (exception): ", exc);
		});	
	});	
}

let erase_reset_token = function(rclient, token) {
	return new Promise(function(resolve, reject) {
		rclient.delAsync(token).then(
			function(success) {
				console.log('erase_reset_token (success): ', token);
				resolve('erase_reset_token (success): ', token);
			},
			function(error) {
				console.log('erase_reset_token (error): ', error);
				reject(console.log('erase_reset_token (success): ', error));
			}
		).
		catch(function(exc) {
			console.log('erase_reset_token (exception): ', exc);
			reject('erase_reset_token (exception): ', exc);
		});
	});
}

let validateResetToken = function(rclient, token) {
	return new Promise(function(resolve, reject){
		get_cid(rclient, token).then(
	        function(cid) {
	            if(cid) {
	                resolve(true);
	            }
	            else {
	                resolve(false);
	            }
	        },
	        function(error) {
	            console.log("passreset.validateResetToken error: ", error);
	            reject(false);
	        }
	    ).catch(function(exc){
	        console.log("passreset.validateResetToken exception: ", exc);
	        reject(false);
	    });	
	});
};
exports.validateResetToken = validateResetToken;
exports.insert_reset_token = insert_reset_token;
exports.get_cid = get_cid;
exports.erase_reset_token = erase_reset_token;