var express = require('express');

var boadrs = require('./../data/boards');
var errors = require('./errors');

var router = express.Router();

//board page 0
router.get('/:name', function(req, res, next) {
    if(boadrs[req.params.name]) {
        res.end('WIN');
    }
    else {
        next();
    }
});

//thread
router.get('/:name/trd/:num', function(req, res, next) {
    //
});

//board page > 0
router.get('/:name/:num', function(req, res, next) {
    if(boadrs[req.params.name] && boadrs[req.params.name].pages > req.params.num && req.params.num >= 0) {
        res.end('WIN');
    }
    else {
        next();
    }
});

module.exports = router;