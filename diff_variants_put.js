const fs = require('fs');
const oldSwagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));
const newSwagger = JSON.parse(fs.readFileSync('swagger_latest.json', 'utf8'));

const oldPut = oldSwagger.paths['/api/v1/variants/{id}']['put'];
const newPut = newSwagger.paths['/api/v1/variants/{id}']['put'];

console.log('--- OLD ---');
console.log(JSON.stringify(oldPut, null, 2));
console.log('--- NEW ---');
console.log(JSON.stringify(newPut, null, 2));
