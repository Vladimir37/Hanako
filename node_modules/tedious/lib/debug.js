'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _events = require('events');

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var Debug = (function (_EventEmitter) {
  _inherits(Debug, _EventEmitter);

  /*
    @options    Which debug details should be sent.
                data    - dump of packet data
                payload - details of decoded payload
  */

  function Debug(options) {
    _classCallCheck(this, Debug);

    _get(Object.getPrototypeOf(Debug.prototype), 'constructor', this).call(this);

    this.options = options;
    this.options = this.options || {};
    this.options.data = this.options.data || false;
    this.options.payload = this.options.payload || false;
    this.options.packet = this.options.packet || false;
    this.options.token = this.options.token || false;
    this.indent = '  ';
  }

  _createClass(Debug, [{
    key: 'packet',
    value: function packet(direction, _packet) {
      if (this.haveListeners() && this.options.packet) {
        this.log('');
        this.log(direction);
        this.log(_packet.headerToString(this.indent));
      }
    }
  }, {
    key: 'data',
    value: function data(packet) {
      if (this.haveListeners() && this.options.data) {
        this.log(packet.dataToString(this.indent));
      }
    }
  }, {
    key: 'payload',
    value: function payload(generatePayloadText) {
      if (this.haveListeners() && this.options.payload) {
        this.log(generatePayloadText());
      }
    }
  }, {
    key: 'token',
    value: function token(_token) {
      if (this.haveListeners() && this.options.token) {
        this.log(_util2['default'].inspect(_token, false, 5, true));
      }
    }
  }, {
    key: 'haveListeners',
    value: function haveListeners() {
      return this.listeners('debug').length > 0;
    }
  }, {
    key: 'log',
    value: function log(text) {
      this.emit('debug', text);
    }
  }]);

  return Debug;
})(_events.EventEmitter);

exports['default'] = Debug;
module.exports = exports['default'];