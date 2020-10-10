const config = {
  servicePort: 12345,
  db: {
    host: '192.168.1.101',
    port: 3306,
    user: 'namit',
    password: 'namit',
    database: 'chess_academy_1',
    connectionTimeout: 10000,
    queryTimeout: 5000,
  },
};

module.exports = config;
