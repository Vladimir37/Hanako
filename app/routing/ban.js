var db = require('../assist/database');
var errors = require('./errors');

function ban_checking(req, res, next) {
    var need_ip = req.ip;
    db.bans.findAll({
        where: {
            ip: need_ip
        }
    }).then(function(bans) {
        res.render('main/ban', {bans: bans});
    }, function(err) {
        console.log(err);
        errors.e500(req, res, next);
    });
};

module.exports = ban_checking;