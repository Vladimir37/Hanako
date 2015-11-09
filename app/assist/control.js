var db = require('./database');
var errors = require('../routing/errors')
var fo = require('./file_operation');

//RegExp
var re = new RegExp('^[\.\:0-9A-Z]+$');

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

//ban and unban
function ban(req, res, next) {
    var type = req.body.type;
    var respondent = res.modId;
    var time = req.body.time;
    var reason = req.body.reason;
    var board = req.body.board || null;
    switch(type) {
        case "1":
            //ban to IP
            var ip = req.body.ip;
            db.bans.create({
                board: board,
                reason: reason,
                respondent: respondent,
                time: time
            }).then(function() {
                res.redirect('/admin/bans');
            }, function(err) {
                console.log(err);
                errors.e500(req, res, next);
            });
            break;
        case "2":
            //ban to post's ID
            var post_id = req.body.post_id;
            db[board + '_posts'].findById(post_id).then(function(post) {
                if(result) {
                    db.bans.create({
                        board: board,
                        reason: reason,
                        respondent: respondent,
                        time: time
                    });
                    res.redirect('/admin/bans');
                }
                else {
                    errors.e500(req, res, next);
                }
            }, function(err) {
                console.log(err);
                errors.e500(req, res, next);
            });
            break;
        case "3":
            //unban to ID
            var unban_id = req.body.num;
            db.bans.destroy({where: {
                id: unban_id
            }}).then(function() {
                res.redirect('/admin/bans');
            }, function(err) {
                console.log(err);
                errors.e500(req, res, next);
            });
            break;
        default:
            errors.e500(req, res, next);
            break;
    };
};

exports.report = report;
exports.spam = spam;
exports.ban = ban;