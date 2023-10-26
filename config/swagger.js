const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0', // версія Swagger/OpenAPI
    info: {
      title: 'E-Commerce API',
      version: '1.0.0',
      description: 'API description',
    },
  },
  // Список шляхів до файлів, в яких описані ваші роути
  apis: ['../index.js'], // Призначте свій шлях
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
