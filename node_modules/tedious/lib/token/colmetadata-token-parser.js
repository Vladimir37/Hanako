'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _metadataParser = require('../metadata-parser');

var _metadataParser2 = _interopRequireDefault(_metadataParser);

function readTableName(parser, options, metadata, callback) {
  if (metadata.type.hasTableName) {
    if (options.tdsVersion >= '7_2') {
      parser.readUInt8(function (numberOfTableNameParts) {
        var tableName = [];

        var i = 0;
        function next(done) {
          if (numberOfTableNameParts === i) {
            return done();
          }

          parser.readUsVarChar(function (part) {
            tableName.push(part);

            i++;

            next(done);
          });
        }

        next(function () {
          callback(tableName);
        });
      });
    } else {
      parser.readUsVarChar(callback);
    }
  } else {
    callback(undefined);
  }
}

function readColumnName(parser, options, index, metadata, callback) {
  parser.readBVarChar(function (colName) {
    if (options.columnNameReplacer) {
      callback(options.columnNameReplacer(colName, index, metadata));
    } else if (options.camelCaseColumns) {
      callback(colName.replace(/^[A-Z]/, function (s) {
        return s.toLowerCase();
      }));
    } else {
      callback(colName);
    }
  });
}

function readColumn(parser, options, index, callback) {
  (0, _metadataParser2['default'])(parser, options, function (metadata) {
    readTableName(parser, options, metadata, function (tableName) {
      readColumnName(parser, options, index, metadata, function (colName) {
        callback({
          userType: metadata.userType,
          flags: metadata.flags,
          type: metadata.type,
          colName: colName,
          collation: metadata.collation,
          precision: metadata.precision,
          scale: metadata.scale,
          udtInfo: metadata.udtInfo,
          dataLength: metadata.dataLength,
          tableName: tableName
        });
      });
    });
  });
}

exports['default'] = function (parser, colMetadata, options, callback) {
  parser.readUInt16LE(function (columnCount) {
    var columns = [];

    var i = 0;
    function next(done) {
      if (i === columnCount) {
        return done();
      }

      readColumn(parser, options, i, function (column) {
        columns.push(column);

        i++;
        next(done);
      });
    }

    next(function () {
      callback({
        name: 'COLMETADATA',
        event: 'columnMetadata',
        columns: columns
      });
    });
  });
};

module.exports = exports['default'];