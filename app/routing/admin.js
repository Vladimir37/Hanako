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
router.get('/bans', status(2), render.ban);
//boards menu
router.get('/boards', status(3), render.boards);
//creating and deleting admins
router.get('/admins', status(3), render.admin);
//exit
router.get('/exit', control.exit);

//POST requests

//login
router.post('/login', login);
//reports handling
router.post('/reports', status(0), control.report);
//add and delete spam words
router.post('/spam', status(1), control.spam);
//ban and unban
router.post('/bans', status(2), control.ban);
//adding and updating boards
router.post('/boards', status(3), control.boards);
//operation with admins
router.post('/admins', status(3), control.admin);
//actions with threads
router.post('/action', status(0), control.actions);

module.exports = router;