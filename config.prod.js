const config = {
  servicePort: 12345,
  db: {
    host: 'chess-academy-1.c7l3okgeerot.ap-southeast-1.rds.amazonaws.com',
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'chess_academy_1',
    connectionTimeout: 1000,
    queryTimeout: 5000,
  },
};

module.exports = config;
