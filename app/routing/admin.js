var express = require('express');

var status = require('../assist/status');
var login = require('../assist/login');
var render = require('../assist/render');
var control = require('../assist/control');

var router = express.Router();

//admin login
router.get('/login', render.jade('admin/login'));
//admin panel
router.get('/panel', status(0), render.jade('admin/panel'));
//reports list
router.get('/reports', status(0), render.reports);
//spam menu
router.get('/spam', status(1), render.spam);
//bans menu
router.get('/bans', status(2));
//boards menu
router.get('/boards', status(3));
//creating and deleting admins
router.get('/admins', status(3));

//POST requests

//login
router.post('/login', login);
//reports handling
router.post('/reports', status(0), control.report);
//add and delete spam words
router.post('/spam', status(1), control.spam);

module.exports = router;