var Crypt = require('easy-encryption');

var db = require('./database');
var captcha = require('./captcha');
var errors = require('../routing/errors');
var crypt_config = require('../../configs/crypt_admin');

//pass decryption
var crypt = new Crypt(crypt_config);

//main login function
function login(req, res, next) {
    var name = req.body.name;
    var pass_encrypt = req.body.pass;
    var c_value = req.body.c_value;
    var c_key = req.body.c_key;
    //checking captcha
    if(captcha.check_f(c_key, c_value) == 200) {
        db.admins.findOne({where: {
            name: name
        }}).then(function(admin) {
            //
        }, function(err) {
            console.log(err);
            errors.e500(req, res);
        });
    }
    else {
        errors.e449(req, res);
    }
};

module.exports = login;