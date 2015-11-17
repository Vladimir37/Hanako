var db = require('./database');
var errors = require('../routing/errors');
var admin_crypt = require('./admin_crypt');

//checking for moderator and him/her status for admin's pages
function checking(need_status) {
    return function(req, res, next) {
        //search moderator's cookie
        if (req.cookies.hanako_admin) {
            //decrypt
            var name = admin_crypt.decrypt(req.cookies.hanako_admin);
            var name_arr;
            //separation name and IP
            try {
                name_arr = name.split('_');
            }
            catch(err) {
                errors.e403(req, res, next);
            }
            //request to DB
            db.admins.findOne({where: {
                name: name_arr[0],
                active: 1
            }}).then(function(moderator) {
                if(moderator && name_arr[1] == req.ip && need_status <= moderator.status) {
                    res.modId = moderator.id;
                    res.modStatus = moderator.status;
                    next();
                }
                else {
                    errors.e403(req, res, next);
                }
            }, function(err) {
                console.log(err);
                errors.e500(req, res, next);
            });
        }
        else {
            errors.e403(req, res, next);
        }
    }
};

module.exports = checking;