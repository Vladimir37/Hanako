'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _readableStream = require('readable-stream');

var _readableStream2 = _interopRequireDefault(_readableStream);

var _bl = require('bl');

var _bl2 = _interopRequireDefault(_bl);

var Job = function Job(length, execute) {
  _classCallCheck(this, Job);

  this.length = length;
  this.execute = execute;
}

// These jobs are non-dynamic, so we can reuse the job objects.
// This should reduce GC pressure a bit (as less objects will be
// created and garbage collected during stream parsing).
;

var JOBS = {
  'readInt8': new Job(1, function (buffer, offset) {
    return buffer.readInt8(offset);
  }),
  'readUInt8': new Job(1, function (buffer, offset) {
    return buffer.readUInt8(offset);
  }),
  'readInt16LE': new Job(2, function (buffer, offset) {
    return buffer.readInt16LE(offset);
  }),
  'readInt16BE': new Job(2, function (buffer, offset) {
    return buffer.readInt16BE(offset);
  }),
  'readUInt16LE': new Job(2, function (buffer, offset) {
    return buffer.readUInt16LE(offset);
  }),
  'readUInt16BE': new Job(2, function (buffer, offset) {
    return buffer.readUInt16BE(offset);
  }),
  'readInt32LE': new Job(4, function (buffer, offset) {
    return buffer.readInt32LE(offset);
  }),
  'readInt32BE': new Job(4, function (buffer, offset) {
    return buffer.readInt32BE(offset);
  }),
  'readUInt32LE': new Job(4, function (buffer, offset) {
    return buffer.readUInt32LE(offset);
  }),
  'readUInt32BE': new Job(4, function (buffer, offset) {
    return buffer.readUInt32BE(offset);
  }),
  'readInt64LE': new Job(8, function (buffer, offset) {
    return Math.pow(2, 32) * buffer.readInt32LE(offset + 4) + (buffer[offset + 4] & 0x80 === 0x80 ? 1 : -1) * buffer.readUInt32LE(offset);
  }),
  'readInt64BE': new Job(8, function (buffer, offset) {
    return Math.pow(2, 32) * buffer.readInt32BE(offset) + (buffer[offset] & 0x80 === 0x80 ? 1 : -1) * buffer.readUInt32BE(offset + 4);
  }),
  'readUInt64LE': new Job(8, function (buffer, offset) {
    return Math.pow(2, 32) * buffer.readUInt32LE(offset + 4) + buffer.readUInt32LE(offset);
  }),
  'readUInt64BE': new Job(8, function (buffer, offset) {
    return Math.pow(2, 32) * buffer.readUInt32BE(offset) + buffer.readUInt32BE(offset + 4);
  }),
  'readFloatLE': new Job(4, function (buffer, offset) {
    return buffer.readFloatLE(offset);
  }),
  'readFloatBE': new Job(4, function (buffer, offset) {
    return buffer.readFloatBE(offset);
  }),
  'readDoubleLE': new Job(8, function (buffer, offset) {
    return buffer.readDoubleLE(offset);
  }),
  'readDoubleBE': new Job(8, function (buffer, offset) {
    return buffer.readDoubleBE(offset);
  })
};

var StreamParser = (function (_stream$Transform) {
  _inherits(StreamParser, _stream$Transform);

  function StreamParser(options) {
    _classCallCheck(this, StreamParser);

    options = options || {};

    if (options.objectMode === undefined) {
      options.objectMode = true;
    }

    _get(Object.getPrototypeOf(StreamParser.prototype), 'constructor', this).call(this, options);

    this.buffer = new _bl2['default']();
    this.generator = undefined;
    this.currentStep = undefined;
  }

  _createClass(StreamParser, [{
    key: 'parser',
    value: function parser() {
      throw new Error('Not implemented');
    }
  }, {
    key: '_transform',
    value: function _transform(input, encoding, done) {
      this.buffer.append(input);

      if (!this.generator) {
        this.generator = this.parser();
        this.currentStep = this.generator.next();
      }

      var offset = 0;
      while (!this.currentStep.done) {
        var job = this.currentStep.value;
        if (!(job instanceof Job)) {
          return done(new Error('invalid job type'));
        }

        var _length = job.length;
        if (this.buffer.length - offset < _length) {
          break;
        }

        var result = job.execute(this.buffer, offset);
        offset += _length;
        this.currentStep = this.generator.next(result);
      }

      this.buffer.consume(offset);

      if (this.currentStep.done) {
        this.push(null);
      }

      done();
    }
  }, {
    key: 'readBuffer',
    value: function readBuffer(length) {
      return new Job(length, function (buffer, offset) {
        return buffer.slice(offset, offset + length);
      });
    }
  }, {
    key: 'readString',
    value: function readString(length) {
      return new Job(length, function (buffer, offset) {
        return buffer.toString('utf8', offset, offset + length);
      });
    }
  }, {
    key: 'skip',
    value: function skip(length) {
      return new Job(length, function () {});
    }
  }]);

  return StreamParser;
})(_readableStream2['default'].Transform);

exports['default'] = StreamParser;

_Object$keys(JOBS).forEach(function (jobName) {
  return StreamParser.prototype[jobName] = function () {
    return JOBS[jobName];
  };
});
module.exports = exports['default'];