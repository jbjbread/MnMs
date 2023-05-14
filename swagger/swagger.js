const swaggerUi = require('swagger-ui-express');
const swaggereJsdoc = require('swagger-jsdoc');

const options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'MnMs API',
            version: '1.0.0',
            description: 'MnMs API 문서입니다.',
        },
        servers: [
            {
                url: 'http://15.164.94.18:3000/',
            }
        ],
        host: 'http://15.164.94.18:3000/',
        basePath: '/'
    },
    apis: ['./routers/*.js', "./routers/users/*.js", "./routers/auth/*.js", './controllers/*.js']
};

const specs = swaggereJsdoc(options);

module.exports = {
    swaggerUi,
    specs
};