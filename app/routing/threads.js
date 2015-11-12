var express = require('express');

var render = require('../assist/render');
var pages = require('../assist/pages_checking');
var boadrs = require('./../data/boards');
var errors = require('./errors');

var router = express.Router();

//index page
router.get('/', render.index);

//board page 0
router.get('/:name', pages.dashboard);

//thread
router.get('/:name/trd/:num', pages.thread);

//board page > 0
router.get('/:name/:num', pages.dashboard);

module.exports = router;