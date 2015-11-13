var concat = require('concat-stream');
var fs = require('graceful-fs');
var forEach = require('lodash.foreach');

module.exports = function(callback) {
  var write = concat(function(data) {
    var trips = [];

    var lines = data.toString().split('\n');
    forEach(lines, function(line) {
      var pair = line.split('!');
      if (pair[3]) {
        trips.push([pair[0], pair[1]]);
      }
    });

    callback(null, trips);
  });
  var quest = fs.createReadStream(__dirname + '/fixtures/tripcodes.txt');
  quest.pipe(write);
};