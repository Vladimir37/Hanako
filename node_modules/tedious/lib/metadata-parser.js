'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _collation = require('./collation');

var _dataType = require('./data-type');

var _sprintf = require('sprintf');

function readDataLength(parser, type, callback) {
  if ((type.id & 0x30) === 0x20) {
    // xx10xxxx - s2.2.4.2.1.3
    // Variable length
    switch (type.dataLengthLength) {
      case 0:
        return callback(undefined);

      case 1:
        return parser.readUInt8(callback);

      case 2:
        return parser.readUInt16LE(callback);

      case 4:
        return parser.readUInt32LE(callback);

      default:
        return parser.emit(new Error("Unsupported dataLengthLength " + type.dataLengthLength + " for data type " + type.name));
    }
  } else {
    callback(undefined);
  }
}

function readPrecision(parser, type, callback) {
  if (type.hasPrecision) {
    parser.readUInt8(callback);
  } else {
    callback(undefined);
  }
}

function readScale(parser, type, callback) {
  if (type.hasScale) {
    parser.readUInt8(callback);
  } else {
    callback(undefined);
  }
}

function readCollation(parser, type, callback) {
  if (type.hasCollation) {
    // s2.2.5.1.2
    parser.readBuffer(5, function (collationData) {
      var collation = {};

      collation.lcid = (collationData[2] & 0x0F) << 16;
      collation.lcid |= collationData[1] << 8;
      collation.lcid |= collationData[0];

      collation.codepage = _collation.codepageByLcid[collation.lcid];

      // This may not be extracting the correct nibbles in the correct order.
      collation.flags = collationData[3] >> 4;
      collation.flags |= collationData[2] & 0xF0;

      // This may not be extracting the correct nibble.
      collation.version = collationData[3] & 0x0F;

      collation.sortId = collationData[4];

      callback(collation);
    });
  } else {
    callback(undefined);
  }
}

function readSchema(parser, type, callback) {
  if (type.hasSchemaPresent) {
    // s2.2.5.5.3
    parser.readUInt8(function (schemaPresent) {
      if (schemaPresent === 0x01) {
        parser.readBVarChar(function (dbname) {
          parser.readBVarChar(function (owningSchema) {
            parser.readUsVarChar(function (xmlSchemaCollection) {
              callback({
                dbname: dbname,
                owningSchema: owningSchema,
                xmlSchemaCollection: xmlSchemaCollection
              });
            });
          });
        });
      } else {
        callback(undefined);
      }
    });
  } else {
    callback(undefined);
  }
}

function readUDTInfo(parser, type, callback) {
  if (type.hasUDTInfo) {
    parser.readUInt16LE(function (maxByteSize) {
      parser.readBVarChar(function (dbname) {
        parser.readBVarChar(function (owningSchema) {
          parser.readBVarChar(function (typeName) {
            parser.readUsVarChar(function (assemblyName) {
              callback({
                maxByteSize: maxByteSize,
                dbname: dbname,
                owningSchema: owningSchema,
                typeName: typeName,
                assemblyName: assemblyName
              });
            });
          });
        });
      });
    });
  } else {
    return callback();
  }
}

exports['default'] = function (parser, options, callback) {
  (options.tdsVersion < "7_2" ? parser.readUInt16LE : parser.readUInt32LE).call(parser, function (userType) {
    parser.readUInt16LE(function (flags) {
      parser.readUInt8(function (typeNumber) {
        var type = _dataType.TYPE[typeNumber];

        if (!type) {
          return parser.emit(new Error((0, _sprintf.sprintf)('Unrecognised data type 0x%02X', typeNumber)));
        }

        readDataLength(parser, type, function (dataLength) {
          readPrecision(parser, type, function (precision) {
            readScale(parser, type, function (scale) {
              if (scale && type.dataLengthFromScale) {
                dataLength = type.dataLengthFromScale(scale);
              }

              readCollation(parser, type, function (collation) {
                readSchema(parser, type, function (schema) {
                  readUDTInfo(parser, type, function (udtInfo) {
                    callback({
                      userType: userType,
                      flags: flags,
                      type: type,
                      collation: collation,
                      precision: precision,
                      scale: scale,
                      dataLength: dataLength,
                      schema: schema,
                      udtInfo: udtInfo
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};

module.exports = exports['default'];