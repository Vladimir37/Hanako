var express =  require('express');
var path = require('path');

var captcha = require('./assist/captcha');
var errors = require('./routing/errors');
var threads = require('./routing/threads');
var admin = require('./routing/admin')

var app = express();
//render templates
app.set('view engine', 'jade');
app.set('views', __dirname +  '/../client/views');

//threads and main
app.use('/', threads);

//admin's panel
//app.use('/admin', admin);

//captcha
app.use('/test', captcha.render);

//public source
app.use('/src', express.static(__dirname + '/../client/source'));

//Errors
app.use(errors.e404);
app.use(errors.render);

module.exports = app;