
let env = {
    beanstalk: {
        host:  'e6156.cck9ji2rhmk4.us-east-1.rds.amazonaws.com',
        port: 3306,
        adapter: 'db',
        url: 'mysql://microservice:thePassword@e6156.cck9ji2rhmk4.us-east-1.rds.amazonaws.com:3306/social_customers',
        base_url: 'http://d27dzg4gy23rtl.cloudfront.net'
    },
    local: {
        host:  '127.0.0.1',
        port: 3306,
        adapter: 'db',
        url: 'mysql://microservice:thePassword@localhost:3306/social_customers',
        base_url: "localhost:3000"
    }
};

let dyn = {
        accessKeyId: process.env.aws_access_key_id,
        secretAccessKey: process.env.aws_secret_access_key,
        region: "us-east-1"
};

exports.getDyn = function() {
        return dyn;
}

exports.getApig = function() {
        return 'https://8s24k0ounj.execute-api.us-east-1.amazonaws.com/default';
}

exports.getEnv = function(n) {
    return env[n];
};
