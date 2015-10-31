# easy-encryption

[![Circle CI](https://circleci.com/gh/digitaledgeit/easy-encryption.svg?style=svg)](https://circleci.com/gh/digitaledgeit/easy-encryption)

A wrapper around the built-in `crypto` module that makes encryption easy in Node.js. 

Uses the `AES-256-CBC` algorithm for encryption and the `pbkdf2` algorithm to derive keys for protection against dictionary attacks.

## Installation

    npm install --save easy-encryption
    
## Usage

With zero configuration:

    var ee = require('easy-encryption');
    
    var ciphertext  = ee.encrypt('password', 'This message is TOP secret!!!');
    var plaintext   = ee.decrypt('password', ciphertext);

    console.log(ciphertext);  //outputs: "<iv>$<salt>$<ciphertext>"
    console.log(plaintext);   //outputs: "This message is TOP secret!!!"
    
With some configuration:

    var Cipher = require('easy-encryption');
    
    var cipher = new Cipher({
      secret:     'password', 
      iterations: 8192
    });
    
    var ciphertext  = cipher.encrypt('This message is TOP secret!!!');
    var plaintext   = cipher.decrypt(ciphertext);
    
    console.log(ciphertext);  //outputs: "<iv>$<salt>$<ciphertext>"
    console.log(plaintext);   //outputs: "This message is TOP secret!!!"
    
## API

### .encrypt(secret, plaintext)

Encrypt some text with a secret

### .decrypt(secret, ciphertext)

Decrypt some encrypted text with a secret

### new Cipher(options)

Create and configure a new cipher instance.

- **secret** - the secret used for encrypting and decrypting text
- **iterations** - the number of times that the secret is hashed with the `pbkdf2` algorithm

### cipher.encrypt([secret], plaintext)

Encrypt some text with a secret

### cipher.decrypt([secret], ciphertext)

Decrypt some encrypted text with a secret

## License

The MIT License (MIT)

Copyright (c) 2015 James Newell

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.