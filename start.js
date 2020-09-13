const app = require('./app');
const config = require('./config');

const server = app.listen(config.servicePort, () => {
  console.log(`Express is running on port ${server.address().port}`);
});

