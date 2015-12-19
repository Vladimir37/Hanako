// s2.2.7.16

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports['default'] = function (parser, colMetadata, options, callback) {
  parser.readInt32LE(function (value) {
    callback({
      name: 'RETURNSTATUS',
      event: 'returnStatus',
      value: value
    });
  });
};

module.exports = exports['default'];