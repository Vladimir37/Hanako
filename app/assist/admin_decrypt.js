var Crypt = require('easy-encryption');

var crypt_config = require('../../configs/crypt_admin');

var crypt = new Crypt(crypt_config);

function decrypt(text) {
    try{
        return crypt.decrypt(text);
    }
    catch(err) {
        return null;
    }
};

module.exports = decrypt;