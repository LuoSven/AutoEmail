const current_env = 'dev';// process.env.hasOwnProperty('NODE_ENV') ? (process.env.NODE_ENV === 'DEVELOPMENT' ? 'dev' : 'prod') : 'dev';

const settings = {
    port: 8002,
    secret: 'jwt_pisolution',
    // bigDataQuery: 'http://10.9.248.221:80/v1/qos/overall'
};

module.exports = Object.assign({}, settings, require('./environment/env.' + current_env));
