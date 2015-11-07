var db = require('./database');
var errors = require('../routing/errors');
var crypt_config = require('../../../configs/crypt_admin');

//generate crypt object
function crypt_generate() {
    return new Crypt(crypt_config);
};

//decryption cookie
function decrypt(text) {
    try{
        return result = crypt_generate().decrypt(text);
    }
    catch(err) {
        return null;
    }
};

//checking for moderator and him/her status
function checking(need_status) {
    return function(req, res, next) {
        //search moderator's cookie
        if (req.cookies.hanako_admin) {
            //decrypt
            var name = decrypt(req.cookies.hanako_admin);
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