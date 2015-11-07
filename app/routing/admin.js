var express = require('express');

var render = require('../assist/render');

var router = express.Router();

//admin login
router.get('/login', render.jade('login'));

module.exports = router;