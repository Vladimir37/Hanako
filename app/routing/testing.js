var express = require('express');
var captcha = require('../assist/captcha');

var router = express.Router();

//render
router.get('/', captcha.render);
//checking
router.post('/', captcha.check_r);
//new captcha
router.get('/new', captcha.new_ajax);

module.exports = router;