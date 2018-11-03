let logging = require('../../lib/logging');

let insert_activation_token = function(rclient, token, cid) {
	return new Promise(function(resolve, reject){
		rclient.setAsync(token, cid, 'EX', 86400).then( 
			function(success) {
				console.log("insert_activation_token (success): ", token.toString() + " : " + cid.toString());
				resolve("insert_activation_token (success): ", token.toString() + " : " + cid.toString());
			},
			function(error) {
				console.log("insert_activation_token (error): ", error);
				reject("insert_activation_token (error): ", error);
			}
		).catch(function(exc) {
			console.log("activation.insert_activation_token (exception): ", exc);
			reject("activation.insert_activation_token (exception): ", exc);
		});
	});
};

let get_email = function(rclient, token) {
	return new Promise(function(resolve, reject) {
		rclient.getAsync(token).then(
			function(success) {
				console.log("activation.get_by_cid (success): ", token);
				resolve(success);
			},
			function(error) {
				console.log("activation.get_by_cid (error): ", error);
				reject("activation.get_by_cid (error): ", error);
			}
		).catch(function(exc) {
			console.log("activation.get_by_cid (exception): ", exc);
			reject("activation.get_by_cid (exception): ", exc);
		});	
	});	
}

let erase_activation_token = function(rclient, token) {
	return new Promise(function(resolve, reject) {
		rclient.delAsync(token).then(
			function(success) {
				console.log('activation.erase_activation_token (success): ', token);
				resolve('activation.erase_activation_token (success): ', token);
			},
			function(error) {
				console.log('activation.erase_activation_token (error): ', error);
				reject(console.log('activation.erase_activation_token (success): ', error));
			}
		).
		catch(function(exc) {
			console.log('activation.erase_activation_token (exception): ', exc);
			reject('activation.erase_activation_token (exception): ', exc);
		});
	});
}

let validateActivationToken = function(rclient, token) {
	return new Promise(function(resolve, reject){
		get_email(rclient, token).then(
	        function(cid) {
	            if(cid) {
	                resolve(true);
	            }
	            else {
	                resolve(false);
	            }
	        },
	        function(error) {
	            console.log("activation.validateActivationToken error: ", error);
	            reject(false);
	        }
	    ).catch(function(exc){
	        console.log("activation.validateActivationToken exception: ", exc);
	        reject(false);
	    });	
	});
};
exports.validateActivationToken = validateActivationToken;
exports.insert_activation_token = insert_activation_token;
exports.get_email = get_email;
exports.erase_activation_token = erase_activation_token;