var express = require('express');

var boadrs = require('./data/boards');

var router = express.Router();

router.get('/:name', function(req, res) {
    if(boadrs[req.params.name]) {
        res.end('WIN');
    }
    else {
        res.end('NOT FOUND');
    }
});
router.get('/:name/trd/:num', function(req, res) {
    //
});
router.get('/:name/:num', function(req, res) {
    if(boadrs[req.params.name] && boadrs[req.params.name].pages > req.params.num && req.params.num >= 0) {
        res.end('WIN');
    }
    else {
        res.end('NOT FOUND');
    }
});

module.exports = router;