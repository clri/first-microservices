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

var additionalParams2 = {
        queryParams: {
                items: [1]
        }
};

var additionalParams3 = {
        queryParams: {
                items: [1,1]
        }
};

var additionalParams4 = {
        queryParams: {
                items: [1, 2]
        }
};

var additionalParams5 = {
        queryParams: {
                items: [1, 2, 3489]
        }
};

var apigClientFactory = require('aws-api-gateway-client').default;

var apigClient = apigClientFactory.newClient({
        invokeUrl: invokeU
});

let testA = function() {
        apigClient.invokeApi(params, '/userPrivilege', 'GET', body, additionalParams)
        .then(function(result){
                logging.debug_message(result['data']);
        }).catch( function(err){
                logging.debug_message(err);
        });
}

let testB = function(adpar) {
        apigClient.invokeApi(params, '/validateOrders', 'GET', body, adpar)
        .then(function(result){
                logging.debug_message(result['data']);
        }).catch( function(err){
                logging.debug_message(err);
        });
}

let testC = function() {
        apigClient.invokeApi(params, '/getallProducts', 'GET', body, {})
        .then(function(result){
                logging.debug_message(result['data']);
        }).catch( function(err){
                logging.debug_message(err);
        });
}

//testA();
//testB(additionalParams2);
//testB(additionalParams3);
//testB(additionalParams4);
//testB(additionalParams5);
testC();
