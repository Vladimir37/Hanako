var express = require('express');

var render = require('../assist/render');
var control = require('../assist/control');
var pages = require('../assist/pages_checking');
var status_common = require('../assist/status_common');
var boards_list = require('../assist/boards_list');

var router = express.Router();

//admin or user
router.use(status_common);

//load boards list
router.use(boards_list);

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
router.post('/:name/trd/:num', control.posting);
//creating thread
router.post('/:name/*', control.posting);
router.post('/:name/', control.posting);

module.exports = router;