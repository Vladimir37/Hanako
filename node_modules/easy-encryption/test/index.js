var assert    = require('assert');
var Cipher    = require('..');

describe('easy-encryption', function() {

  describe('.salt()', function() {

    it('should return a buffer', function() {
      assert(Cipher().salt() instanceof Buffer);
    });

    it('should never return the same value', function() {
      assert.notEqual(
        Cipher().salt().toString('hex'),
        Cipher().salt().toString('hex')
      );
    });

  });

  describe('.hash()', function() {

    it('should return a buffer', function() {
      var cipher = new Cipher();
      assert(cipher.hash(cipher.salt(), 'password') instanceof Buffer);
    });

    it('should be 32 bytes in length', function() {
      var cipher = new Cipher(), salt = cipher.salt();
      assert.equal(
        cipher.hash(salt, 'password').length,
        32
      );
    });

    it('same salt and password should return the same hash', function() {
      var cipher = new Cipher(), salt = cipher.salt();
      assert.equal(
        cipher.hash(salt, 'password').toString('hex'),
        cipher.hash(salt, 'password').toString('hex')
      );
    });

    it('same salt and different password should return a different hash', function() {
      var cipher = new Cipher(), salt = cipher.salt();
      assert.notEqual(
        cipher.hash(salt, 'password1').toString('hex'),
        cipher.hash(salt, 'password2').toString('hex')
      );
    });

    it('same password and different salt should return a different hash', function() {
      var cipher = new Cipher();
      assert.notEqual(
        cipher.hash(cipher.salt(), 'password').toString('hex'),
        cipher.hash(cipher.salt(), 'password').toString('hex')
      );
    });

  });

  describe('.encrypt()', function() {

    it('should produce an output string made up of three parts - the IV, salt and cipher text', function() {
      assert.equal(Cipher.encrypt('password', 'This message is TOP secret!!!').split('$').length, 3);
    });

    it('the same password and plain text should never produce the same output string', function() {
      assert.notEqual(
        Cipher.encrypt('password', 'This message is TOP secret!!!'),
        Cipher.encrypt('password', 'This message is TOP secret!!!')
      );
    });

    it('should be symmetric', function() {
      assert.equal(
        Cipher.decrypt(
          'password',
          Cipher.encrypt('password', 'This message is TOP secret!!!')
        ),
        'This message is TOP secret!!!'
      );
    });

  });

  describe('.decrypt()', function() {

    it('unsafe cipher text should be decoded', function() {
      assert.equal(
        Cipher.decrypt(
          'password',
          'fbeec170dbba9691d4df6bd706093a7a0a143d18ca936cec838e8deca332bb15'
        ),
        'This message is TOP secret!!!'
      );
    });

    it('safe cipher text should be decoded', function() {
      assert.equal(
        Cipher.decrypt(
          'password',
          '44fb2c2705454001915785f7ab42fc33$0ce314fcc7d4804e6741f7fda3f7bcea046678b1dc9f2a6' +
          '79592c2d621df44c2275a8ae72aa3435fd72c974777cd4b01fe0c29061305423265e7c4069b0f4e5' +
          '271a464b0310190bf6fb7f31fc5a680f2bd413e8afeac672e91f8f4b556eb2962f1df52943c22237' +
          '30587f206b23de2948989668fd358d0278028e62214ef4454$31402795f91e53736959dad86dd02c' +
          '14f336d170575721e86707961c9e243221'
        ),
        'This message is TOP secret!!!'
      );
    });

    it('should throw an error when the cipher text is missing a part', function() {
      assert.throws(function() {
        Cipher.decrypt(
          'password',
          '0ce314fcc7d4804e6741f7fda3f7bcea046678b1dc9f2a6' +
          '79592c2d621df44c2275a8ae72aa3435fd72c974777cd4b01fe0c29061305423265e7c4069b0f4e5' +
          '271a464b0310190bf6fb7f31fc5a680f2bd413e8afeac672e91f8f4b556eb2962f1df52943c22237' +
          '30587f206b23de2948989668fd358d0278028e62214ef4454$31402795f91e53736959dad86dd02c' +
          '14f336d170575721e86707961c9e243221'
        )
      });
    });

    it('should throw an error when the cipher text has an extra part', function() {
      assert.throws(function() {
        Cipher.decrypt(
          'password',
          '44fb2c2705454001915785f7ab42fc33$0ce314fcc7d4804e6741f7fda3f7bcea046678b1dc9f2a6' +
          '79592c2d621df44c2275a8ae72aa3435fd72c974777cd4b01fe0c29061305423265e7c4069b0f4e5' +
          '271a464b0310190bf6fb7f31fc5a680f2bd413e8afeac672e91f8f4b556eb2962f1df52943c22237' +
          '30587f206b23de2948989668fd358d0278028e62214ef4454$31402795f91e53736959dad86dd02c' +
          '14f336d170575721e86707961c9e243221$abc'
        )
      });
    });

    it('should throw an error when the password is incorrect', function() {
      assert.throws(function() {
        Cipher.decrypt(
          'incorrect-password',
          '44fb2c2705454001915785f7ab42fc33$0ce314fcc7d4804e6741f7fda3f7bcea046678b1dc9f2a6' +
          '79592c2d621df44c2275a8ae72aa3435fd72c974777cd4b01fe0c29061305423265e7c4069b0f4e5' +
          '271a464b0310190bf6fb7f31fc5a680f2bd413e8afeac672e91f8f4b556eb2962f1df52943c22237' +
          '30587f206b23de2948989668fd358d0278028e62214ef4454$31402795f91e53736959dad86dd02c' +
          '14f336d170575721e86707961c9e243221'
        )
      });
    });

    it('should throw an error when the cipher text is incorrect', function() {
      assert.throws(function() {
        Cipher.decrypt(
          'password',
          '44fb2c2705454001915785f7ab42fc33$0ce314fcc7d4804e6741f7fda3f7bcea046678b1dc9f2a6' +
          '79592c2d621df44c2275a8ae72aa3435fd72c974777cd4b01fe0c29061305423265e7c4069b0f4e5' +
          '271a464b0310190bf6fb7f31fc5a680f2bd413e8afeac672e91f8f4b556eb2962f1df52943c22237' +
          '30587f206b23de2948989668fd358d0278028e62214ef4454$31402795f91e53736959dad86dd02c' +
          '14f336d170575721e86707961c9e243221aa'
        )
      });
    });

  });

  it('should use default password if none is specified', function() {
    var cipher = new Cipher({secret: 'password'});
    assert.equal(
      cipher.decrypt(
        cipher.encrypt('This message is TOP secret!!!')
      ),
      'This message is TOP secret!!!'
    );
  });

});