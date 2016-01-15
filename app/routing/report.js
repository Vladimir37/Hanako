var express = require('express');

var db = require('../assist/database');

var router = express.Router();

router.post('/', report);

//processing and save report
function report(req, res, next) {
    var report_data = {};
    report_data.ip = req.ip;
    report_data.text = req.body.text;
    report_data.board = req.body.board;
    report_data.thread = req.body.thread;
    if(
        report_data.text
        && report_data.board
        && report_data.thread
    ) {
        db.reports.create(report_data);
        res.end('0');
    }
    else {
        res.end('1');
    }
};

module.exports = router;