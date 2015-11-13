var express =  require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var testing = require('./routing/testing');
var errors = require('./routing/errors');
var threads = require('./routing/threads');
var admin = require('./routing/admin');

var app = express();

//render templates
app.set('view engine', 'jade');
app.set('views', __dirname +  '/../client/views');

//POST request and cookies
app.use(cookieParser());
app.use(bodyParser());

//admin's panel
app.use('/admin', admin);

//captcha
app.use('/testing', testing);

//public source
app.use('/src', express.static(__dirname + '/../client/source'));

//threads and main
app.use('/', threads);

//Errors
app.use(errors.e404);
app.use(errors.render);

module.exports = app;