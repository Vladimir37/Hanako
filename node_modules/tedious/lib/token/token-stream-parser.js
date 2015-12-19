"use strict";

var _get = require("babel-runtime/helpers/get")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _streamParser = require("./stream-parser");

var _streamParser2 = _interopRequireDefault(_streamParser);

/*
  Buffers are thrown at the parser (by calling addBuffer).
  Tokens are parsed from the buffer until there are no more tokens in
  the buffer, or there is just a partial token left.
  If there is a partial token left over, then it is kept until another
  buffer is added, which should contain the remainder of the partial
  token, along with (perhaps) more tokens.
  The partial token and the new buffer are concatenated, and the token
  parsing resumes.
 */

var Parser = (function (_EventEmitter) {
  _inherits(Parser, _EventEmitter);

  function Parser(debug, colMetadata, options) {
    var _this = this;

    _classCallCheck(this, Parser);

    _get(Object.getPrototypeOf(Parser.prototype), "constructor", this).call(this);

    this.debug = debug;
    this.colMetadata = this.colMetadata;
    this.options = options;

    this.parser = new _streamParser2["default"](this.debug, this.colMetadata, this.options);
    this.parser.on("data", function (token) {
      if (token.event) {
        _this.emit(token.event, token);
      }
    });
  }

  _createClass(Parser, [{
    key: "addBuffer",
    value: function addBuffer(buffer) {
      return this.parser.write(buffer);
    }
  }, {
    key: "isEnd",
    value: function isEnd() {
      return this.parser.buffer.length === this.parser.position;
    }
  }]);

  return Parser;
})(_events.EventEmitter);

exports.Parser = Parser;