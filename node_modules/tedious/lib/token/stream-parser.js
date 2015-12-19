"use strict";

var _defineProperty = require("babel-runtime/helpers/define-property")["default"];

var _get = require("babel-runtime/helpers/get")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _tokenParsers;

var _readableStream = require("readable-stream");

var _token = require("./token");

var tokenParsers = (_tokenParsers = {}, _defineProperty(_tokenParsers, _token.TYPE.COLMETADATA, require('./colmetadata-token-parser')), _defineProperty(_tokenParsers, _token.TYPE.DONE, require('./done-token-parser').doneParser), _defineProperty(_tokenParsers, _token.TYPE.DONEINPROC, require('./done-token-parser').doneInProcParser), _defineProperty(_tokenParsers, _token.TYPE.DONEPROC, require('./done-token-parser').doneProcParser), _defineProperty(_tokenParsers, _token.TYPE.ENVCHANGE, require('./env-change-token-parser')), _defineProperty(_tokenParsers, _token.TYPE.ERROR, require('./infoerror-token-parser').errorParser), _defineProperty(_tokenParsers, _token.TYPE.INFO, require('./infoerror-token-parser').infoParser), _defineProperty(_tokenParsers, _token.TYPE.LOGINACK, require('./loginack-token-parser')), _defineProperty(_tokenParsers, _token.TYPE.ORDER, require('./order-token-parser')), _defineProperty(_tokenParsers, _token.TYPE.RETURNSTATUS, require('./returnstatus-token-parser')), _defineProperty(_tokenParsers, _token.TYPE.RETURNVALUE, require('./returnvalue-token-parser')), _defineProperty(_tokenParsers, _token.TYPE.ROW, require('./row-token-parser')), _defineProperty(_tokenParsers, _token.TYPE.NBCROW, require('./nbcrow-token-parser')), _defineProperty(_tokenParsers, _token.TYPE.SSPI, require('./sspi-token-parser')), _tokenParsers);

var Parser = (function (_Transform) {
  _inherits(Parser, _Transform);

  function Parser(debug, colMetadata, options) {
    _classCallCheck(this, Parser);

    _get(Object.getPrototypeOf(Parser.prototype), "constructor", this).call(this, { objectMode: true });

    this.debug = debug;
    this.colMetadata = colMetadata;
    this.options = options;

    this.buffer = new Buffer(0);
    this.position = 0;
    this.suspended = false;
    this.await = undefined;
    this.next = undefined;
  }

  _createClass(Parser, [{
    key: "_transform",
    value: function _transform(input, encoding, done) {
      if (this.position === this.buffer.length) {
        this.buffer = input;
      } else {
        this.buffer = Buffer.concat([this.buffer.slice(this.position), input]);
      }
      this.position = 0;

      // This will be called once we need to wait for more data to
      // become available
      this.await = done;

      if (this.suspended) {
        // Unsuspend and continue from where ever we left off.
        this.suspended = false;
        this.next.call(null);
      }

      // If we're no longer suspended, parse new tokens
      if (!this.suspended) {
        // Start the parser
        this.parseTokens();
      }
    }
  }, {
    key: "parseTokens",
    value: function parseTokens() {
      var _this = this;

      var doneParsing = function doneParsing(token) {
        if (token) {
          switch (token.name) {
            case 'COLMETADATA':
              _this.colMetadata = token.columns;
          }

          _this.push(token);
        }
      };

      while (!this.suspended && this.position + 1 <= this.buffer.length) {
        var type = this.buffer.readUInt8(this.position, true);

        this.position += 1;

        if (tokenParsers[type]) {
          tokenParsers[type](this, this.colMetadata, this.options, doneParsing);
        } else {
          this.emit('error', new Error("Unknown type: " + type));
        }
      }

      if (!this.suspended && this.position === this.buffer.length) {
        // If we reached the end of the buffer, we can stop parsing now.
        return this.await.call(null);
      }
    }
  }, {
    key: "suspend",
    value: function suspend(next) {
      this.suspended = true;
      this.next = next;
      this.await.call(null);
    }
  }, {
    key: "awaitData",
    value: function awaitData(length, callback) {
      var _this2 = this;

      if (this.position + length <= this.buffer.length) {
        callback();
      } else {
        this.suspend(function () {
          _this2.awaitData(length, callback);
        });
      }
    }
  }, {
    key: "readInt8",
    value: function readInt8(callback) {
      var _this3 = this;

      this.awaitData(1, function () {
        var data = _this3.buffer.readInt8(_this3.position);
        _this3.position += 1;
        callback(data);
      });
    }
  }, {
    key: "readUInt8",
    value: function readUInt8(callback) {
      var _this4 = this;

      this.awaitData(1, function () {
        var data = _this4.buffer.readUInt8(_this4.position);
        _this4.position += 1;
        callback(data);
      });
    }
  }, {
    key: "readInt16LE",
    value: function readInt16LE(callback) {
      var _this5 = this;

      this.awaitData(2, function () {
        var data = _this5.buffer.readInt16LE(_this5.position);
        _this5.position += 2;
        callback(data);
      });
    }
  }, {
    key: "readInt16BE",
    value: function readInt16BE(callback) {
      var _this6 = this;

      this.awaitData(2, function () {
        var data = _this6.buffer.readInt16BE(_this6.position);
        _this6.position += 2;
        callback(data);
      });
    }
  }, {
    key: "readUInt16LE",
    value: function readUInt16LE(callback) {
      var _this7 = this;

      this.awaitData(2, function () {
        var data = _this7.buffer.readUInt16LE(_this7.position);
        _this7.position += 2;
        callback(data);
      });
    }
  }, {
    key: "readUInt16BE",
    value: function readUInt16BE(callback) {
      var _this8 = this;

      this.awaitData(2, function () {
        var data = _this8.buffer.readUInt16BE(_this8.position);
        _this8.position += 2;
        callback(data);
      });
    }
  }, {
    key: "readInt32LE",
    value: function readInt32LE(callback) {
      var _this9 = this;

      this.awaitData(4, function () {
        var data = _this9.buffer.readInt32LE(_this9.position);
        _this9.position += 4;
        callback(data);
      });
    }
  }, {
    key: "readInt32BE",
    value: function readInt32BE(callback) {
      var _this10 = this;

      this.awaitData(4, function () {
        var data = _this10.buffer.readInt32BE(_this10.position);
        _this10.position += 4;
        callback(data);
      });
    }
  }, {
    key: "readUInt32LE",
    value: function readUInt32LE(callback) {
      var _this11 = this;

      this.awaitData(4, function () {
        var data = _this11.buffer.readUInt32LE(_this11.position);
        _this11.position += 4;
        callback(data);
      });
    }
  }, {
    key: "readUInt32BE",
    value: function readUInt32BE(callback) {
      var _this12 = this;

      this.awaitData(4, function () {
        var data = _this12.buffer.readUInt32BE(_this12.position);
        _this12.position += 4;
        callback(data);
      });
    }
  }, {
    key: "readInt64LE",
    value: function readInt64LE(callback) {
      var _this13 = this;

      this.awaitData(8, function () {
        var data = Math.pow(2, 32) * _this13.buffer.readInt32LE(_this13.position + 4) + (_this13.buffer[_this13.position + 4] & 0x80 === 0x80 ? 1 : -1) * _this13.buffer.readUInt32LE(_this13.position);
        _this13.position += 8;
        callback(data);
      });
    }
  }, {
    key: "readInt64BE",
    value: function readInt64BE(callback) {
      var _this14 = this;

      this.awaitData(8, function () {
        var data = Math.pow(2, 32) * _this14.buffer.readInt32BE(_this14.position) + (_this14.buffer[_this14.position] & 0x80 === 0x80 ? 1 : -1) * _this14.buffer.readUInt32BE(_this14.position + 4);
        _this14.position += 8;
        callback(data);
      });
    }
  }, {
    key: "readUInt64LE",
    value: function readUInt64LE(callback) {
      var _this15 = this;

      this.awaitData(8, function () {
        var data = Math.pow(2, 32) * _this15.buffer.readUInt32LE(_this15.position + 4) + _this15.buffer.readUInt32LE(_this15.position);
        _this15.position += 8;
        callback(data);
      });
    }
  }, {
    key: "readUInt64BE",
    value: function readUInt64BE(callback) {
      var _this16 = this;

      this.awaitData(8, function () {
        var data = Math.pow(2, 32) * _this16.buffer.readUInt32BE(_this16.position) + _this16.buffer.readUInt32BE(_this16.position + 4);
        _this16.position += 8;
        callback(data);
      });
    }
  }, {
    key: "readFloatLE",
    value: function readFloatLE(callback) {
      var _this17 = this;

      this.awaitData(4, function () {
        var data = _this17.buffer.readFloatLE(_this17.position);
        _this17.position += 4;
        callback(data);
      });
    }
  }, {
    key: "readFloatBE",
    value: function readFloatBE(callback) {
      var _this18 = this;

      this.awaitData(4, function () {
        var data = _this18.buffer.readFloatBE(_this18.position);
        _this18.position += 4;
        callback(data);
      });
    }
  }, {
    key: "readDoubleLE",
    value: function readDoubleLE(callback) {
      var _this19 = this;

      this.awaitData(8, function () {
        var data = _this19.buffer.readDoubleLE(_this19.position);
        _this19.position += 8;
        callback(data);
      });
    }
  }, {
    key: "readDoubleBE",
    value: function readDoubleBE(callback) {
      var _this20 = this;

      this.awaitData(8, function () {
        var data = _this20.buffer.readDoubleBE(_this20.position);
        _this20.position += 8;
        callback(data);
      });
    }
  }, {
    key: "readUInt24LE",
    value: function readUInt24LE(callback) {
      var _this21 = this;

      this.awaitData(3, function () {
        var low = _this21.buffer.readUInt16LE(_this21.position);
        var high = _this21.buffer.readUInt8(_this21.position + 2);

        _this21.position += 3;

        callback(low | high << 16);
      });
    }
  }, {
    key: "readUInt40LE",
    value: function readUInt40LE(callback) {
      var _this22 = this;

      this.awaitData(5, function () {
        var low = _this22.buffer.readUInt32LE(_this22.position);
        var high = _this22.buffer.readUInt8(_this22.position + 4);

        _this22.position += 5;

        callback(0x100000000 * high + low);
      });
    }
  }, {
    key: "readUNumeric64LE",
    value: function readUNumeric64LE(callback) {
      var _this23 = this;

      this.awaitData(8, function () {
        var low = _this23.buffer.readUInt32LE(_this23.position);
        var high = _this23.buffer.readUInt32LE(_this23.position + 4);

        _this23.position += 8;

        callback(0x100000000 * high + low);
      });
    }
  }, {
    key: "readUNumeric96LE",
    value: function readUNumeric96LE(callback) {
      var _this24 = this;

      this.awaitData(12, function () {
        var dword1 = _this24.buffer.readUInt32LE(_this24.position);
        var dword2 = _this24.buffer.readUInt32LE(_this24.position + 4);
        var dword3 = _this24.buffer.readUInt32LE(_this24.position + 8);

        _this24.position += 12;

        callback(dword1 + 0x100000000 * dword2 + 0x100000000 * 0x100000000 * dword3);
      });
    }
  }, {
    key: "readUNumeric128LE",
    value: function readUNumeric128LE(callback) {
      var _this25 = this;

      this.awaitData(16, function () {
        var dword1 = _this25.buffer.readUInt32LE(_this25.position);
        var dword2 = _this25.buffer.readUInt32LE(_this25.position + 4);
        var dword3 = _this25.buffer.readUInt32LE(_this25.position + 8);
        var dword4 = _this25.buffer.readUInt32LE(_this25.position + 12);

        _this25.position += 16;

        callback(dword1 + 0x100000000 * dword2 + 0x100000000 * 0x100000000 * dword3 + 0x100000000 * 0x100000000 * 0x100000000 * dword4);
      });
    }

    // Variable length data

  }, {
    key: "readBuffer",
    value: function readBuffer(length, callback) {
      var _this26 = this;

      this.awaitData(length, function () {
        var data = _this26.buffer.slice(_this26.position, _this26.position + length);
        _this26.position += length;
        callback(data);
      });
    }

    // Read a Unicode String (BVARCHAR)
  }, {
    key: "readBVarChar",
    value: function readBVarChar(callback) {
      var _this27 = this;

      this.readUInt8(function (length) {
        _this27.readBuffer(length * 2, function (data) {
          callback(data.toString("ucs2"));
        });
      });
    }

    // Read a Unicode String (USVARCHAR)
  }, {
    key: "readUsVarChar",
    value: function readUsVarChar(callback) {
      var _this28 = this;

      this.readUInt16LE(function (length) {
        _this28.readBuffer(length * 2, function (data) {
          callback(data.toString("ucs2"));
        });
      });
    }

    // Read binary data (BVARBYTE)
  }, {
    key: "readBVarByte",
    value: function readBVarByte(callback) {
      var _this29 = this;

      this.readUInt8(function (length) {
        _this29.readBuffer(length, callback);
      });
    }

    // Read binary data (USVARBYTE)
  }, {
    key: "readUsVarByte",
    value: function readUsVarByte(callback) {
      var _this30 = this;

      this.readUInt16LE(function (length) {
        _this30.readBuffer(length, callback);
      });
    }
  }]);

  return Parser;
})(_readableStream.Transform);

exports["default"] = Parser;
module.exports = exports["default"];