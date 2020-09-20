const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

app.use(session({
    secret: 'secret_to_read_from_file_later',
    saveUninitialized: true,
    resave: false,
    cookie: { maxAge: 1000*60*60 }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", req.get('Origin'));
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Credentials", true);
    next();
});

const routes = require('./routes/index');
app.use('/', routes);

module.exports = app;

