fetch('https://shoppefake-545163055657.asia-southeast1.run.app/swagger/v1/swagger.json')
  .then(res => res.json())
  .then(data => {
     require('fs').writeFileSync('swagger.json', JSON.stringify(data, null, 2));
     console.log('Swagger JSON downloaded successfully.');
     
     // Print all paths for quick overview
     const paths = Object.keys(data.paths);
     console.log('Available endpoints:');
     paths.forEach(p => console.log(p));
  })
  .catch(e => {
     console.error('Error fetching swagger:', e);
  });
