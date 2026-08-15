const fs = require('fs');
const oldSwagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));
const newSwagger = JSON.parse(fs.readFileSync('swagger_latest.json', 'utf8'));

const commonPaths = Object.keys(newSwagger.paths).filter(p => Object.keys(oldSwagger.paths).includes(p));

console.log('=== SCHEMA CHANGES IN EXISTING ENDPOINTS ===');
commonPaths.forEach(p => {
  const methods = Object.keys(newSwagger.paths[p]).filter(m => Object.keys(oldSwagger.paths[p]).includes(m));
  methods.forEach(m => {
    const oldStr = JSON.stringify(oldSwagger.paths[p][m]);
    const newStr = JSON.stringify(newSwagger.paths[p][m]);
    if (oldStr !== newStr) {
      console.log(`[CHANGED] Path: ${p} | Method: ${m}`);
    }
  });
});
