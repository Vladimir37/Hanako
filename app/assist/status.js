var db = require('./database');
var errors = require('../routing/errors');
var admin_crypt = require('./admin_crypt');

//checking for moderator and him/her status
function checking(need_status) {
    return function(req, res, next) {
        //search moderator's cookie
        if (req.cookies.hanako_admin) {
            //decrypt
            var name = admin_crypt.decrypt(req.cookies.hanako_admin);
            //request to DB
            db.admins.findOne({where: {
                name: name,
                active: 1
            }}).then(function(moderator) {
                if(moderator) {
                    res.modStatus = moderator.status;
                    next();
                }
                else {
                    errors.e505(req, res, next);
                }
            }, function(err) {
                console.log(err);
                errors.e505(req, res, next);
            });
        }
        else {
            errors.e403(req, res, next);
        }
    }
};

module.exports = checking;