'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.instanceLookup = instanceLookup;
exports.parseBrowserResponse = parseBrowserResponse;

var _dgram = require('dgram');

var _dgram2 = _interopRequireDefault(_dgram);

var SQL_SERVER_BROWSER_PORT = 1434;
var TIMEOUT = 2 * 1000;
var RETRIES = 3;
// There are three bytes at the start of the response, whose purpose is unknown.
var MYSTERY_HEADER_LENGTH = 3;

// Most of the functionality has been determined from from jTDS's MSSqlServerInfo class.

function instanceLookup(server, instanceName, callback, timeout, retries) {
  var socket = undefined,
      timer = undefined;
  timeout = timeout || TIMEOUT;
  var retriesLeft = retries || RETRIES;

  function onMessage(message) {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
    message = message.toString('ascii', MYSTERY_HEADER_LENGTH);
    var port = parseBrowserResponse(message, instanceName);
    socket.close();
    if (port) {
      return callback(undefined, port);
    } else {
      return callback("Port for " + instanceName + " not found in " + message);
    }
  }

  function onError(err) {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
    socket.close();
    return callback("Failed to lookup instance on " + server + " - " + err.message);
  }

  function onTimeout() {
    timer = undefined;
    socket.close();
    return makeAttempt();
  }

  function makeAttempt() {
    if (retriesLeft > 0) {
      retriesLeft--;
      var request = new Buffer([0x02]);
      socket = _dgram2['default'].createSocket('udp4');
      socket.on('error', onError);
      socket.on('message', onMessage);
      socket.send(request, 0, request.length, SQL_SERVER_BROWSER_PORT, server);
      return timer = setTimeout(onTimeout, timeout);
    } else {
      return callback("Failed to get response from SQL Server Browser on " + server);
    }
  }

  return makeAttempt();
}

function parseBrowserResponse(response, instanceName) {
  var getPort = undefined;

  var instances = response.split(';;');
  for (var i = 0, len = instances.length; i < len; i++) {
    var instance = instances[i];
    var parts = instance.split(';');

    for (var p = 0, partsLen = parts.length; p < partsLen; p += 2) {
      var _name = parts[p];
      var value = parts[p + 1];

      if (_name === 'tcp' && getPort) {
        var port = parseInt(value, 10);
        return port;
      }

      if (_name === 'InstanceName') {
        if (value.toUpperCase() === instanceName.toUpperCase()) {
          getPort = true;
        } else {
          getPort = false;
        }
      }
    }
  }
}