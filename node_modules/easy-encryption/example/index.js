var ee = require('..');

var ciphertext  = ee.encrypt('password', 'This message is TOP secret!!!');
var plaintext   = ee.decrypt('password', ciphertext);

console.log(ciphertext);  //outputs: "<iv>$<salt>$<ciphertext>"
console.log(plaintext);   //outputs: "This message is TOP secret!!!"
