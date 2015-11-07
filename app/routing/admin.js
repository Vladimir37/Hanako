var express = require('express');

var status = require('../assist/status');
var login = require('../assist/login');
var render = require('../assist/render');

var router = express.Router();

//admin login
router.get('/login', render.jade('admin/login'));
//admin panel
router.get('/panel', status(), render.jade('admin/panel'));

//POST requests

//login
router.post('/login', login);

module.exports = router;