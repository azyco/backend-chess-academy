const app = require('./app');
const config = require('./config');

const server = app.listen(config.servicePort, config.serviceIP, () => {
  // eslint-disable-next-line no-console
  console.log(`Express is running on port ${server.address().port}`);
});
