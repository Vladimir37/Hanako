var Crypt = require('easy-encryption');

var crypt_config = require('../../configs/crypt_admin');

var crypt = new Crypt(crypt_config);

function encrypt(text) {
    try{
        return crypt.encrypt(text);
    }
    catch(err) {
        return null;
    }
}

function decrypt(text) {
    try{
        return crypt.decrypt(text);
    }
    catch(err) {
        return null;
    }
};

exports.encrypt = encrypt;
exports.decrypt = decrypt;