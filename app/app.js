var express =  require('express');
var path = require('path');

var router = require('./router');

var app = express();
app.use('/src', express.static(__dirname + '/../client/source'));
app.use('/', router);

module.exports = app;