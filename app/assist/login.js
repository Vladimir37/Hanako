var Crypt = require('easy-encryption');

var db = require('./database');
var captcha = require('./captcha');
var errors = require('../routing/errors');
var admin_crypt = require('./admin_crypt');

//main login function
function login(req, res, next) {
    var name = req.body.name;
    var pass = req.body.pass;
    var c_value = req.body.c_value;
    var c_key = req.body.c_key;
    //checking captcha
    if(captcha.check_f(c_key, c_value) == 200) {
        db.admins.findOne({where: {
            name: name
        }}).then(function(admin) {
            if(admin) {
                //pass decryption
                var need_pass = admin_crypt.decrypt(admin.pass);
                if (need_pass == pass) {
                    var cookie_name = admin_crypt.encrypt(name);
                    res.cookie('hanako_admin', cookie_name);
                    res.redirect('/admin/panel');
                }
                else {
                    res.redirect('/admin/login#incorrect');
                }
            }
            else {
                res.redirect('/admin/login#incorrect');
            }
        }, function(err) {
            console.log(err);
            errors.e500(req, res, next);
        });
    }
    else {
        errors.e449(req, res, next);
    }
};

module.exports = login;