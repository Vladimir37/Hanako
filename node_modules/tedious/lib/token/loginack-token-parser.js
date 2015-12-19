'use strict';

var _tdsVersions = require('../tds-versions');

var interfaceTypes = {
  0: 'SQL_DFLT',
  1: 'SQL_TSQL'
};

module.exports = function (parser, colMetadata, options, callback) {
  // length
  parser.readUInt16LE(function () {
    parser.readUInt8(function (interfaceNumber) {
      var interfaceType = interfaceTypes[interfaceNumber];
      parser.readUInt32BE(function (tdsVersionNumber) {
        var tdsVersion = _tdsVersions.versionsByValue[tdsVersionNumber];
        parser.readBVarChar(function (progName) {
          parser.readUInt8(function (major) {
            parser.readUInt8(function (minor) {
              parser.readUInt8(function (buildNumHi) {
                parser.readUInt8(function (buildNumLow) {
                  callback({
                    name: 'LOGINACK',
                    event: 'loginack',
                    "interface": interfaceType,
                    tdsVersion: tdsVersion,
                    progName: progName,
                    progVersion: {
                      major: major,
                      minor: minor,
                      buildNumHi: buildNumHi,
                      buildNumLow: buildNumLow
                    }
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