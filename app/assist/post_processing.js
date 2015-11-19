var tripcode = require('tripcode');
var mime = require('mime');
var fs = require('fs');

var db = require('./database');
var fo = require('./file_operation');

//tripcode and name
function trip(string, permit) {
    var start = string.indexOf('#');
    if(start == -1 || !permit) {
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

function require_trip(id) {
    return tripcode(id);
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

function lock(board, num) {
    return new Promise(function(resolve, reject) {
        db.boards[board].findOne({where: {
            id: num,
            close: 0
        }}).then(function(thread) {
            if(thread) {
                resolve()
            }
            else {
                reject('4');
            }
        })
    }, function(err) {
        console.log(err);
        reject('6');
    });
};

function image(image, board) {
    return new Promise(function(resolve, reject) {
        fo.read('app/data/boards.json').then(function (boards) {
            var board_data = boards[board];
            if(image.size > +board_data.size * 1024 * 1024) {
                fs.unlink(image.path);
                reject(7);
            }
            else if(image.type.slice(0, 6) != 'image/') {
                fs.unlink(image.path);
                reject(8);
            }
            else {
                resolve(mime.extension(image.type));
            }
        }, function(err) {
            console.log(err);
            reject(6);
        });
    });
};

function posts_count(board, thread) {
    return new Promise(function(resolve, reject) {
        if(thread == null) {
            resolve(0);
        }
        else {
            db.boards[board].count({
                where: {
                    $or: {
                        id: thread,
                        thread: thread
                    }
                }
            }).then(function (count) {
                resolve(count);
            }, function (err) {
                console.log(err);
                reject('6')
            });
        }
    });
};

exports.trip = trip;
exports.spam = spam;
exports.ban = ban;
exports.lock = lock;
exports.image = image;
exports.count = posts_count;
exports.require_trip = require_trip;