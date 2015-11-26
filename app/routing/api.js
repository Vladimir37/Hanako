var express = require('express');
var url = require('url');

var api = require('../assist/api');
var boards_list = require('../assist/boards_list');

var router = express.Router();

router.use(function(req, res, next) {
    var url_parts = url.parse(req.url, true);
    var query_data = url_parts.query;
    req.query_data = query_data;
    next();
});

//boards list
router.get('/boards', boards_list, api.boards);

//dashboard
router.get('/dashboard', api.dashboard);

//thread
router.get('/thread', api.thread);

//one post
router.get('/post', api.post);

module.exports = router;