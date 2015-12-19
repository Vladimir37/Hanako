// s2.2.7.13 (introduced in TDS 7.3.B)

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _valueParser = require('../value-parser');

var _valueParser2 = _interopRequireDefault(_valueParser);

function nullHandler(parser, columnMetaData, options, callback) {
  callback(null);
}

exports['default'] = function (parser, columnsMetaData, options, callback) {
  var length = Math.ceil(columnsMetaData.length / 8);
  parser.readBuffer(length, function (bytes) {
    var bitmap = [];

    for (var _i = 0, _len = bytes.length; _i < _len; _i++) {
      var byte = bytes[_i];
      for (var j = 0; j <= 7; j++) {
        bitmap.push(byte & 1 << j ? true : false);
      }
    }

    var columns = options.useColumnNames ? {} : [];

    var len = columnsMetaData.length;
    var i = 0;
    function next(done) {
      if (i === len) {
        return done();
      }

      var columnMetaData = columnsMetaData[i];

      (bitmap[i] ? nullHandler : _valueParser2['default'])(parser, columnMetaData, options, function (value) {
        var column = {
          value: value,
          metadata: columnMetaData
        };

        if (options.useColumnNames) {
          if (columns[columnMetaData.colName] == null) {
            columns[columnMetaData.colName] = column;
          }
        } else {
          columns.push(column);
        }

        i++;
        next(done);
      });
    }

    next(function () {
      callback({
        name: 'NBCROW',
        event: 'row',
        columns: columns
      });
    });
  });
};

module.exports = exports['default'];