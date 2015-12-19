'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _events = require('events');

var _dataType = require('./data-type');

var _errors = require('./errors');

var Request = (function (_EventEmitter) {
  _inherits(Request, _EventEmitter);

  function Request(sqlTextOrProcedure, callback) {
    _classCallCheck(this, Request);

    _get(Object.getPrototypeOf(Request.prototype), 'constructor', this).call(this);

    this.sqlTextOrProcedure = sqlTextOrProcedure;
    this.callback = callback;
    this.parameters = [];
    this.parametersByName = {};
    this.userCallback = this.callback;
    this.callback = function () {
      if (this.preparing) {
        this.emit('prepared');
        return this.preparing = false;
      } else {
        this.userCallback.apply(this, arguments);
        return this.emit('requestCompleted');
      }
    };
  }

  _createClass(Request, [{
    key: 'addParameter',
    value: function addParameter(name, type, value, options) {
      if (options == null) {
        options = {};
      }

      var parameter = {
        type: type,
        name: name,
        value: value,
        output: options.output || (options.output = false),
        length: options.length,
        precision: options.precision,
        scale: options.scale
      };
      this.parameters.push(parameter);
      return this.parametersByName[name] = parameter;
    }
  }, {
    key: 'addOutputParameter',
    value: function addOutputParameter(name, type, value, options) {
      if (options == null) {
        options = {};
      }
      options.output = true;
      return this.addParameter(name, type, value, options);
    }
  }, {
    key: 'makeParamsParameter',
    value: function makeParamsParameter(parameters) {
      var paramsParameter = '';
      for (var i = 0, len = parameters.length; i < len; i++) {
        var parameter = parameters[i];
        if (paramsParameter.length > 0) {
          paramsParameter += ', ';
        }
        paramsParameter += "@" + parameter.name + " ";
        paramsParameter += parameter.type.declaration(parameter);
        if (parameter.output) {
          paramsParameter += ' OUTPUT';
        }
      }
      return paramsParameter;
    }
  }, {
    key: 'transformIntoExecuteSqlRpc',
    value: function transformIntoExecuteSqlRpc() {
      if (this.validateParameters()) {
        return;
      }

      this.originalParameters = this.parameters;
      this.parameters = [];
      this.addParameter('statement', _dataType.typeByName.NVarChar, this.sqlTextOrProcedure);
      if (this.originalParameters.length) {
        this.addParameter('params', _dataType.typeByName.NVarChar, this.makeParamsParameter(this.originalParameters));
      }

      for (var i = 0, len = this.originalParameters.length; i < len; i++) {
        var parameter = this.originalParameters[i];
        this.parameters.push(parameter);
      }
      return this.sqlTextOrProcedure = 'sp_executesql';
    }
  }, {
    key: 'transformIntoPrepareRpc',
    value: function transformIntoPrepareRpc() {
      var _this = this;

      this.originalParameters = this.parameters;
      this.parameters = [];
      this.addOutputParameter('handle', _dataType.typeByName.Int);
      this.addParameter('params', _dataType.typeByName.NVarChar, this.makeParamsParameter(this.originalParameters));
      this.addParameter('stmt', _dataType.typeByName.NVarChar, this.sqlTextOrProcedure);
      this.sqlTextOrProcedure = 'sp_prepare';
      this.preparing = true;
      return this.on('returnValue', function (name, value) {
        if (name === 'handle') {
          return _this.handle = value;
        } else {
          return _this.error = (0, _errors.RequestError)("Tedious > Unexpected output parameter " + name + " from sp_prepare");
        }
      });
    }
  }, {
    key: 'transformIntoUnprepareRpc',
    value: function transformIntoUnprepareRpc() {
      this.parameters = [];
      this.addParameter('handle', _dataType.typeByName.Int, this.handle);
      return this.sqlTextOrProcedure = 'sp_unprepare';
    }
  }, {
    key: 'transformIntoExecuteRpc',
    value: function transformIntoExecuteRpc(parameters) {
      this.parameters = [];
      this.addParameter('handle', _dataType.typeByName.Int, this.handle);

      for (var i = 0, len = this.originalParameters.length; i < len; i++) {
        var parameter = this.originalParameters[i];
        parameter.value = parameters[parameter.name];
        this.parameters.push(parameter);
      }

      if (this.validateParameters()) {
        return;
      }

      return this.sqlTextOrProcedure = 'sp_execute';
    }
  }, {
    key: 'validateParameters',
    value: function validateParameters() {
      for (var i = 0, len = this.parameters.length; i < len; i++) {
        var parameter = this.parameters[i];
        var value = parameter.type.validate(parameter.value);
        if (value instanceof TypeError) {
          return this.error = new _errors.RequestError("Validation failed for parameter '" + parameter.name + "'. " + value.message, "EPARAM");
        }
        parameter.value = value;
      }
      return null;
    }
  }]);

  return Request;
})(_events.EventEmitter);

exports['default'] = Request;
module.exports = exports['default'];