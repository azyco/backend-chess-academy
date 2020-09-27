var config = {
    servicePort: 12345,
    db: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'root',
        database: 'chess_academy_1',
        connectionTimeout: 10000,
        queryTimeout: 5000
    }
}

module.exports = config;
