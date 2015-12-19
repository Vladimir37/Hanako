'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.infoParser = infoParser;
exports.errorParser = errorParser;
function parseToken(parser, options, callback) {
  // length
  parser.readUInt16LE(function () {
    parser.readUInt32LE(function (number) {
      parser.readUInt8(function (state) {
        parser.readUInt8(function (clazz) {
          parser.readUsVarChar(function (message) {
            parser.readBVarChar(function (serverName) {
              parser.readBVarChar(function (procName) {
                (options.tdsVersion < '7_2' ? parser.readUInt16LE : parser.readUInt32LE).call(parser, function (lineNumber) {
                  callback({
                    number: number,
                    state: state,
                    "class": clazz,
                    message: message,
                    serverName: serverName,
                    procName: procName,
                    lineNumber: lineNumber
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}

function infoParser(parser, colMetadata, options, callback) {
  parseToken(parser, options, function (token) {
    token.name = 'INFO';
    token.event = 'infoMessage';
    callback(token);
  });
}

function errorParser(parser, colMetadata, options, callback) {
  parseToken(parser, options, function (token) {
    token.name = 'ERROR';
    token.event = 'errorMessage';
    callback(token);
  });
}