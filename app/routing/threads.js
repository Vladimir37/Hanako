var express = require('express');

var render = require('../assist/render');
var control = require('../assist/control');
var pages = require('../assist/pages_checking');

var router = express.Router();

//index page
router.get('/', render.index);
//board page 0
router.get('/:name', pages.dashboard);
//thread
router.get('/:name/trd/:num', pages.thread);
//board page > 0
router.get('/:name/:num', pages.dashboard);

//POST request

//post to thread
router.post('/:name/trd/:num', control.posting('post'));
//creating thread
router.post('/:name/*', control.posting('thread'));

module.exports = router;