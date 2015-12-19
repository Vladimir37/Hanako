"use strict";

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConnectionError = ConnectionError;
exports.RequestError = RequestError;

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function ConnectionError(message, code) {
  if (!(this instanceof ConnectionError)) {
    if (message instanceof ConnectionError) {
      return message;
    }

    return new ConnectionError(message, code);
  }

  Error.call(this);

  this.message = message;
  this.code = code;

  Error.captureStackTrace(this, this.constructor);
}

_util2["default"].inherits(ConnectionError, Error);

ConnectionError.prototype.name = "ConnectionError";

function RequestError(message, code) {
  if (!(this instanceof RequestError)) {
    if (message instanceof RequestError) {
      return message;
    }

    return new RequestError(message, code);
  }

  Error.call(this);

  this.message = message;
  this.code = code;

  Error.captureStackTrace(this, this.constructor);
}

_util2["default"].inherits(RequestError, Error);

RequestError.prototype.name = "RequestError";