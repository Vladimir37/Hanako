// s2.2.7.17

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _valueParser = require('../value-parser');

var _valueParser2 = _interopRequireDefault(_valueParser);

exports['default'] = function (parser, colMetadata, options, callback) {
  var columns = options.useColumnNames ? {} : [];

  var len = colMetadata.length;
  var i = 0;

  function next(done) {
    if (i === len) {
      return done();
    }

    var columnMetaData = colMetadata[i];
    (0, _valueParser2['default'])(parser, columnMetaData, options, function (value) {
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
      name: 'ROW',
      event: 'row',
      columns: columns
    });
  });
};

module.exports = exports['default'];