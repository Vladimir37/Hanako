var url = require('url');

var db = require('./database');
var captcha = require('./captcha');
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
        order: [['createdAt', 'DESC']]
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

exports.jade = render_jade;
exports.reports = reports;