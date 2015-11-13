var tripcode = require('tripcode');

//tripcode and name
function trip(string) {
    var start = string.indexOf('#');
    if(start == -1) {
        return {
            name: string,
            trip: null
        };
    }
    else {
        var trip_name = tripcode(string.substr(start));
        var main_name = string.substr(0, start);
        return {
            name: main_name,
            trip: trip_name
        }
    }
};

exports.trip = trip;