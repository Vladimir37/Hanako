var db = require('./database');
var errors = require('../routing/errors')
var fo = require('./file_operation');

//reports handling
function report(req, res, next) {
    var admin_id = res.modId;
    var report_id = req.body.id;
    var resolution = req.body.resolution;
    db.reports.update({
        respondent: admin_id,
        resolution: resolution,
        active: 0
    }, {
        where: {
            id: report_id,
            active: 1
        }
    }).then(function() {
        res.redirect('/admin/reports');
    }, function(err) {
        console.log(err);
        errors.e500(req, res, next);
    });
};

//editing spam list
function spam(req, res, next) {
    var board = req.body.board;
    var word = req.body.word;
    fo.read('app/data/spam.json').then(function(spam_list) {
        if(!spam_list[board]) {
            throw new Error('Board not defined');
        }
        var position = spam_list[board].indexOf(word);
        if(position == '-1') {
            spam_list[board].push(word);
        }
        else {
            spam_list[board].splice(position, 1);
        }
        return fo.write('app/data/spam.json', spam_list);
    }).then(function() {
        res.redirect('/admin/spam');
    }).catch(function(err) {
        console.log(err);
        errors.e500(req, res, next);
    });
};

exports.report = report;
exports.spam = spam;