//test for APIGClient

let logging = require('../lib/logging');

var params = {};
var body = {};
var additionalParams = {
        queryParams: {
                uid: 'jaja1'
        }
};

var apigClientFactory = require('aws-api-gateway-client').default;

var apigClient = apigClientFactory.newClient({
        invokeUrl:'https://8s24k0ounj.execute-api.us-east-1.amazonaws.com/default'
});

apigClient.invokeApi(params, '/userPrivilege', 'GET', body, additionalParams)
.then(function(result){
        logging.debug_message(result);
}).catch( function(err){
        logging.debug_message(err);
});
