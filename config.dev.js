const config = {
  servicePort: 12345,
  serviceIP: '0.0.0.0',
  db: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'chess_academy_1',
    connectionTimeout: 10000,
    queryTimeout: 5000,
  },
};

module.exports = config;
