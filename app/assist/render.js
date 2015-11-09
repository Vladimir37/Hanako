var url = require('url');
var fs = require('fs');

var db = require('./database');
var captcha = require('./captcha');
var fo = require('./file_operation');
var errors = require('../routing/errors');

//render jade file
function render_jade(name) {
    return function(req, res, next) {
        var variables = {
            c_key: captcha.new()
        };
        res.render(name, variables);
    }
};

//render reports list (admin)
function reports(req, res, next) {
    var url_parts = url.parse(req.url, true);
    var active = 1;
    if(url_parts.query.active == 'not') {
        active = 0;
    }
    db.reports.findAll({
        where: {
            active: active
        },
        order: [['id', 'DESC']],
        include: [{model: db.admins}]
    }).then(function(reports) {
        var variables = {
            reports: reports,
            active: active,
            count: reports.length
        };
        res.render('admin/reports', variables);
    }, function(err) {
        console.log(err);
        errors.e500(req, res, next);
    });
};

//render spam menu
function spam(req, res, next) {
    fo.read('app/data/spam.json').then(function(spam_list) {
        res.render('admin/spam', {spam: spam_list});
    }, function(err) {
        console.log(err);
        errors.e500(req, res, next);
    });
};

//render ban menu
function ban(req, res, next) {
    var variables = {};
    db.bans.findAll({
        order: [['id', 'DESC']],
        include: [{model: db.admins}]
    }).then(function(bans) {
        variables.bans = bans;
        variables.count = bans.length;
        return fo.read('app/data/boards.json');
    }).then(function(boards) {
        variables.boards = boards;
        res.render('admin/bans', variables);
    }).catch(function() {
        errors.e500(req, res, next);
    });
};

//boards menu
function boards(req, res, next) {
    fo.read('app/data/boards.json').then(function(boards) {
        res.render('admin/boards', {
            boards: boards,
            count: Object.keys(boards).length
        });
    }, function(err) {
        console.log(err);
        errors.e500(req, res, next);
    });
};

exports.jade = render_jade;
exports.reports = reports;
exports.spam = spam;
exports.ban = ban;
exports.boards = boards;