var crypto = require('crypto');

/**
 * A simple wrapper around the built-in crypto methods
 * @constructor
 * @param   {Object}  [options]
 * @param   {string}  [options.secret]
 * @param   {number}  [options.iterations]
 */
function Cipher(options) {

  if (!(this instanceof Cipher)) {
    return new Cipher(options);
  }

  options         = options || {};
  this.secret     = options.secret || null;
  this.iterations = options.iterations || 8192;

}

Cipher.ALGORITHM = 'AES-256-CBC';

Cipher.prototype = {

  /**
   * Generate a random string of bytes for use as a salt
   * @returns {Buffer}
   */
  salt: function() {
    return crypto.randomBytes(128);
  },

  /**
   * Derive a new secret by hashing the secret
   * @param   {string|Buffer} salt
   * @param   {string} secret
   * @returns {string}
   */
  hash: function(salt, secret) {
    return crypto.pbkdf2Sync(secret, salt, this.iterations, 32/* 256 bits */, 'sha1');
  },

  safeEncrypt: function(secret, plaintext) {
    var
      iv   = crypto.randomBytes(16), //128 bits
      salt = this.salt(),
      key  = this.hash(salt, secret) //prevent dictionary attacks by salting/hashing the secret so the resulting cipher text is different each time even though the same secret is used
    ;

    var cipher = crypto.createCipheriv(Cipher.ALGORITHM, key, iv);
    cipher.write(plaintext, 'utf8');
    cipher.end();

    var ciphertext = cipher.read();

    return iv.toString('hex')+'$'+salt.toString('hex')+'$'+ciphertext.toString('hex');
  },

  safeDecrypt: function(secret, ciphertext) {
    var parts = ciphertext.split('$');

    if (parts.length !== 3) {
      throw new Error('Format of cipher text is not supported.');
    }

    var
      iv    = new Buffer(parts[0], 'hex'),
      salt  = new Buffer(parts[1], 'hex'),
      key   = this.hash(salt, secret)
    ;

    var decipher = crypto.createDecipheriv(Cipher.ALGORITHM, key, iv);
    decipher.write(parts[2], 'hex');
    decipher.end();
    return decipher.read().toString('utf8');
  },

  unsafeEncrypt: function(secret, plaintext) {
    var cipher = crypto.createCipher(Cipher.ALGORITHM, secret);
    cipher.write(plaintext, 'utf8');
    cipher.end();
    return cipher.read().toString('hex');
  },

  unsafeDecrypt: function(secret, ciphertext) {
    var decipher = crypto.createDecipher(Cipher.ALGORITHM, secret);
    decipher.write(ciphertext, 'hex');
    decipher.end();
    return decipher.read().toString('utf8');
  },

  /**
   * Encrypt some encrypted text with a secret
   * @param   {string}        [secret]
   * @param   {string|Buffer} plaintext
   * @returns {string}
   */
  encrypt: function(secret, plaintext) {

    if (arguments.length < 2) {
      plaintext   = secret;
      secret      = this.secret;
    }

    return this.safeEncrypt(secret, plaintext);
  },

  /**
   * Decrypt some text with a secret
   * @param   {string}        [secret]
   * @param   {string|Buffer} ciphertext
   * @returns {string}
   */
  decrypt: function(secret, ciphertext) {

    if (arguments.length < 2) {
      ciphertext  = secret;
      secret      = this.secret;
    }

    if (ciphertext.indexOf('$') === -1) {
      return this.unsafeDecrypt(secret, ciphertext);
    } else {
      return this.safeDecrypt(secret, ciphertext);
    }

  }

};

module.exports = Cipher;

var cipher;

/**
 * Encrypt some text with a secret
 * @param   {string}        secret
 * @param   {string|Buffer} plaintext
 * @returns {string}
 */
Cipher.encrypt = function(password, plaintext) {
  if (!cipher) {
    cipher = new Cipher();
  }
  return cipher.encrypt(password, plaintext);
};

/**
 * Decrypt some text with a secret
 * @param   {string}        secret
 * @param   {string|Buffer} ciphertext
 * @returns {string}
 */
Cipher.decrypt = function(password, ciphertext) {
  if (!cipher) {
    cipher = new Cipher();
  }
  return cipher.decrypt(password, ciphertext);
};