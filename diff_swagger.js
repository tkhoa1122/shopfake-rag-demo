const fs = require('fs');
const oldSwagger = JSON.parse(fs.readFileSync('swagger.json', 'utf8'));
const newSwagger = JSON.parse(fs.readFileSync('swagger_latest.json', 'utf8'));

const oldPaths = Object.keys(oldSwagger.paths);
const newPaths = Object.keys(newSwagger.paths);

const added = newPaths.filter(p => !oldPaths.includes(p));
const removed = oldPaths.filter(p => !newPaths.includes(p));
const common = newPaths.filter(p => oldPaths.includes(p));

console.log('=== ADDED ENDPOINTS ===');
added.forEach(p => console.log(p, Object.keys(newSwagger.paths[p])));

console.log('\n=== REMOVED ENDPOINTS ===');
removed.forEach(p => console.log(p));

console.log('\n=== MODIFIED ENDPOINTS ===');
common.forEach(p => {
  const oldMethods = Object.keys(oldSwagger.paths[p]);
  const newMethods = Object.keys(newSwagger.paths[p]);
  
  const addedMethods = newMethods.filter(m => !oldMethods.includes(m));
  const removedMethods = oldMethods.filter(m => !newMethods.includes(m));
  
  if (addedMethods.length > 0 || removedMethods.length > 0) {
    console.log(p, 'Added:', addedMethods, 'Removed:', removedMethods);
  }
});
