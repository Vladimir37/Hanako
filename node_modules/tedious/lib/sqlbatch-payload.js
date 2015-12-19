'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _trackingBufferTrackingBuffer = require('./tracking-buffer/tracking-buffer');

var _allHeaders = require('./all-headers');

/*
  s2.2.6.6
 */

var SqlBatchPayload = (function () {
  function SqlBatchPayload(sqlText, txnDescriptor, options) {
    _classCallCheck(this, SqlBatchPayload);

    this.sqlText = sqlText;

    var buffer = new _trackingBufferTrackingBuffer.WritableTrackingBuffer(100 + 2 * this.sqlText.length, 'ucs2');
    if (options.tdsVersion >= '7_2') {
      var outstandingRequestCount = 1;
      (0, _allHeaders.writeToTrackingBuffer)(buffer, txnDescriptor, outstandingRequestCount);
    }
    buffer.writeString(this.sqlText, 'ucs2');
    this.data = buffer.data;
  }

  _createClass(SqlBatchPayload, [{
    key: 'toString',
    value: function toString(indent) {
      indent || (indent = '');
      return indent + ("SQL Batch - " + this.sqlText);
    }
  }]);

  return SqlBatchPayload;
})();

exports['default'] = SqlBatchPayload;
module.exports = exports['default'];