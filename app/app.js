var express =  require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var te = require('thumb-express');

var testing = require('./routing/testing');
var errors = require('./routing/errors');
var threads = require('./routing/threads');
var admin = require('./routing/admin');
var ban = require('./routing/ban');
var report = require('./routing/report');
var api = require('./routing/api');
var unban = require('./assist/unban');

//checking bans and unbanning
setInterval(unban, 86400000);

var app = express();

//render templates
app.set('view engine', 'jade');
app.set('views', __dirname +  '/../client/views');

//POST request and cookies
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//favicon
app.use(favicon('client/source/img/main/logo/favicon.ico'));

app.use('/api', api);

//admin's panel
app.use('/admin', admin);

//checking ban
app.use('/ban', ban);

//acceptance reports
app.use('/report', report);

//captcha
app.use('/testing', testing);

//small images
app.use('/small', te.init(__dirname + '/../client/source/img/trd'));
//public source
app.use('/src', express.static(__dirname + '/../client/source'));

//threads and main
app.use('/', threads);

//user files
app.use('/', express.static(__dirname + '/../client/views/other'));

//Errors
app.use(errors.e404);
app.use(errors.render);

module.exports = app;