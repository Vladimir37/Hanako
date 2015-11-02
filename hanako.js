var http = require('http');

var config = require('./configs/app');
var app = require('./app/app');

http.createServer(app).listen(config.port);