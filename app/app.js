var express =  require('express');
var path = require('path');

var router = require('./router');

var app = express();
//public source
app.use('/src', express.static(__dirname + '/../client/source'));
//other
app.use('/', router);

module.exports = app;