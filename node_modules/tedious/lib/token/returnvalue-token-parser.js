// s2.2.7.16

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _metadataParser = require('../metadata-parser');

var _metadataParser2 = _interopRequireDefault(_metadataParser);

var _valueParser = require('../value-parser');

var _valueParser2 = _interopRequireDefault(_valueParser);

exports['default'] = function (parser, colMetadata, options, callback) {
  parser.readUInt16LE(function (paramOrdinal) {
    parser.readBVarChar(function (paramName) {
      if (paramName.charAt(0) === '@') {
        paramName = paramName.slice(1);
      }

      // status
      parser.readUInt8(function () {
        (0, _metadataParser2['default'])(parser, options, function (metadata) {
          (0, _valueParser2['default'])(parser, metadata, options, function (value) {
            callback({
              name: 'RETURNVALUE',
              event: 'returnValue',
              paramOrdinal: paramOrdinal,
              paramName: paramName,
              metadata: metadata,
              value: value
            });
          });
        });
      });
    });
  });
};

module.exports = exports['default'];