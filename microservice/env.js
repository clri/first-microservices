
let env = {
    beanstalk: {
        //@TODO: add our details for when we deploy on beanstalk
        /*host:  'aa9u927eqb935j.cqgsme1nmjms.us-east-1.rds.amazonaws.com',
        port: 3306,
        adapter: 'db',
        url: 'mysql://dbuser2:dbuser2@aa9u927eqb935j.cqgsme1nmjms.us-east-1.rds.amazonaws.com:3306/cloude6156'
        */
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
