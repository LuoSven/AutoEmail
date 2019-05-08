
module.exports = {
    apps: [
        {
            name: 'cz_branded_fare_service_server',
            script: './server.js',
            watch: true,
            env: {
                NODE_ENV: 'DEVELOPMENT'
            },
            env_production: {
                NODE_ENV: 'PRODUCTION'
            }
        }
    ]
};
