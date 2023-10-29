// const swaggerJsdoc = require('swagger-jsdoc');
// const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs'); // Додайте залежність 'yamljs' через npm

// Шлях до вашого файлу OpenAPI специфікації
const openapiSpecification = YAML.load('./openapi.yaml');

// Параметри для swagger-jsdoc
// const options = {
//   definition: {
//     openapi: '3.0.3', // Версія OpenAPI
//     info: {
//       title: 'E-Commerce API',
//       version: '1.0.0',
//       description: 'A fully-functioning e-commerce application REST API',
//       license: {
//         name: 'Apache 2.0',
//         url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
//       },
//     },
//   },
//   // Визначення шляхів до вашого API
//   // apis: ['./routes/*.js'], // Визначте шлях до ваших маршрутів
// };

// const swaggerSpec = swaggerJsdoc(options);

// module.exports = swaggerSpec;
module.exports = openapiSpecification;

