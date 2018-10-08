
let env = {
    beanstalk: {
        host:  'e6156.cck9ji2rhmk4.us-east-1.rds.amazonaws.com',
        port: 3306,
        adapter: 'db',
        url: 'mysql://microservice:thePassword@e6156.cck9ji2rhmk4.us-east-1.rds.amazonaws.com:3306/social_customers'
    },
    local: {
        host:  '127.0.0.1',
        port: 3306,
        adapter: 'db',
        url: 'mysql://microservice:thePassword@localhost:3306/social_customers'
    }
};

exports.getEnv = function(n) {
    return env[n];
};
