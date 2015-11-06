var Crypt = require('easy-encryption');
var captcha = require('node-captcha');
var url = require('url');

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
function key_generate() {
    return new Crypt({
        secret: crypt_config.secret,
        iterations: crypt_config.iterations
    });
};

//render captcha image
function captcha_render(req, res) {
    var url_parts = url.parse(req.url, true);
    var key = url_parts.query.key;
    var c_need =  key_generate().decrypt(key);
    captcha(c_options(c_need), function(text, data) {
        res.end(data);
    })
};

exports.render = captcha_render;