var Crypt = require('easy-encryption');
var captcha = require('node-captcha');
var url = require('url');
var random = require('random-token').create('0987654321');

var crypt_config = require('../../configs/crypt');
var captcha_config = require('../../configs/captcha');

//return captcha options
function c_options(text) {
    var options = captcha_config;
    options.fileMode = 2;
    options.text = text;
    return options;
}

//encrypt/decrypt object generate
function crypt_generate() {
    return new Crypt({
        secret: crypt_config.secret,
        iterations: crypt_config.iterations
    });
};

//render captcha image
function captcha_render(req, res) {
    var url_parts = url.parse(req.url, true);
    var key = url_parts.query.key;
    if(key) {
        var c_need =  crypt_generate().decrypt(key);
        captcha(c_options(c_need), function(text, data) {
            res.end(data);
        });
    }
    else {
        captcha_generate(req, res);
    }
};

//generate captcha key
function captcha_generate(req, res) {
    var options = c_options();
    var key = random(options.size);
    var encrypt_key = crypt_generate().encrypt(key);
    res.redirect('/testing?key=' + encrypt_key);
};

//captcha checking (router)
function captcha_checking(req, res) {
    var key_encrypted = req.body.c_key;
    var value = req.body.c_value;
    var key = crypt_generate().decrypt(key_encrypted);
    if(key == value) {
        res.end(200);
    }
    else {
        res.end('ERROR!');
    }
};

exports.render = captcha_render;