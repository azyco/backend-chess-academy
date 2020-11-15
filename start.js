const config = require('./config');

const { app, server } = require('./app');

// app.set('port', config.servicePort);

server.listen(config.servicePort, config.serviceIP, () => {
  // eslint-disable-next-line no-console
  console.log(`Express is running on port ${server.address().port}`);
});

// const server = app.listen(config.servicePort, config.serviceIP, () => {
//   // eslint-disable-next-line no-console
//   console.log(`Express is running on port ${server.address().port}`);
// });
