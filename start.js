const app = require('./app');
const config = require('./config');

const server = app.listen(config.servicePort, 'localhost', () => {
  console.log(`Express is running on port ${server.address().port}`);
});