var tripcode = require('tripcode');

var db = require('./database');
var fo = require('./file_operation');

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

//spam check
function spam(text, board) {
    return new Promise(function(resolve, reject) {
        fo.read('app/data/spam.json').then(function(spamlist) {
            //all
            for(var i = 0; i < spamlist.all.length; i++) {
                if(text.indexOf(spamlist.all[i]) != -1) {
                    reject('2');
                }
            };
            //board
            for(var j = 0; j < spamlist[board].length; j++) {
                if(text.indexOf(spamlist[board][j]) != -1) {
                    reject('2');
                }
            };
            resolve();
        }, function(err) {
            console.log(err);
            reject('6');
        });
    });
};

//chicking ban
function ban(ip, board) {
    return new Promise(function(resolve, reject) {
        db.bans.findOne({
            where: {
                ip: ip,
                board: {
                    $in: ['All', board]
                }
            }
        }).then(function(ban) {
            if(ban) {
                reject('3');
            }
            else {
                resolve();
            }
        }, function(err) {
            console.log(err);
            reject('6');
        });
    });
};

function image(req) {
    //
};

exports.trip = trip;
exports.spam = spam;
exports.ban = ban;
exports.image = image;