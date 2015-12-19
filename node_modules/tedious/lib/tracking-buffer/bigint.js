'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.convertLEBytesToString = convertLEBytesToString;
exports.numberToInt64LE = numberToInt64LE;
function isZero(array) {
  for (var j = 0, len = array.length; j < len; j++) {
    var byte = array[j];
    if (byte !== 0) {
      return false;
    }
  }
  return true;
}

function getNextRemainder(array) {
  var remainder = 0;

  for (var i = array.length - 1; i >= 0; i--) {
    var s = remainder * 256 + array[i];
    array[i] = Math.floor(s / 10);
    remainder = s % 10;
  }

  return remainder;
}

function invert(array) {
  // Invert bits
  var len = array.length;

  for (var i = 0; i < len; i++) {
    array[i] = array[i] ^ 0xFF;
  }

  for (var i = 0; i < len; i++) {
    array[i] = array[i] + 1;

    if (array[i] > 255) {
      array[i] = 0;
    } else {
      break;
    }
  }
}

function convertLEBytesToString(buffer) {
  var array = Array.prototype.slice.call(buffer, 0, buffer.length);
  if (isZero(array)) {
    return '0';
  } else {
    var sign = undefined;
    if (array[array.length - 1] & 0x80) {
      sign = '-';
      invert(array);
    } else {
      sign = '';
    }
    var result = '';
    while (!isZero(array)) {
      var t = getNextRemainder(array);
      result = t + result;
    }
    return sign + result;
  }
}

function numberToInt64LE(num) {
  // adapted from https://github.com/broofa/node-int64
  var negate = num < 0;
  var hi = Math.abs(num);
  var lo = hi % 0x100000000;
  hi = hi / 0x100000000 | 0;
  var buf = new Buffer(8);
  for (var i = 0; i <= 7; i++) {
    buf[i] = lo & 0xff;
    lo = i === 3 ? hi : lo >>> 8;
  }
  if (negate) {
    var carry = 1;
    for (var i = 0; i <= 7; i++) {
      var v = (buf[i] ^ 0xff) + carry;
      buf[i] = v & 0xff;
      carry = v >> 8;
    }
  }
  return buf;
}