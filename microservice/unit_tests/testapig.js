//test for APIGClient

let logging = require('../lib/logging');
let env = require('../env');

let invokeU = env.getApig();

var params = {};
var body = {};
var additionalParams = {
        queryParams: {
                uid: 'jaja1'
        }
};

var apigClientFactory = require('aws-api-gateway-client').default;

var apigClient = apigClientFactory.newClient({
        invokeUrl: invokeU
});

apigClient.invokeApi(params, '/userPrivilege', 'GET', body, additionalParams)
.then(function(result){
        logging.debug_message(result['data']);
}).catch( function(err){
        logging.debug_message(err);
});
