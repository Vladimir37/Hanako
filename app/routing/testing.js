var express = require('express');
var captcha = require('../assist/captcha');

var router = express.Router();

router.get('/', captcha.render);

//router.post('/');

module.exports = router;