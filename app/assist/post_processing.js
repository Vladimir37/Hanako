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
                reject('7');
            }
            else if(image.type.slice(0, 6) != 'image/') {
                fs.unlink(image.path);
                reject('8');
            }
            else {
                resolve(mime.extension(image.type));
            }
        }, function(err) {
            console.log(err);
            reject('6');
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

function text_processing(text, roulette_permit) {
    var new_text = text.replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\(/g, '&#040;')
    .replace(/\)/g, '&#041;')
    .replace(/\*\*(.+?)\*\*/g, '<b class="bold">$1</b>')
    .replace(/\*(.+?)\*/g, '<strong class="italic">$1</strong>')
    .replace(/_(.+?)_/g, '<em class="crossed">$1</em>')
    .replace(/%%(.+?)%%/g, '<i class="spoiler">$1</i>');
    if(roulette_permit) {
        return processing_roulette(new_text);
    }
    else {
        return new_text;
    }
};

function processing_roulette(text) {
    return text.replace(/([0-9]+)RL([0-9]+)/g, function(all, num1, num2) {
        var roulette_exp = roulette([num1, num2]);
        return roulette_exp;
    });
}

function roulette(num) {
    if(+num[0] <= 100 && +num[1] <= 10 && +num[0] > 0 && +num[1] > 0) {
        var maximum = num[0] * num[1];
        var result = 0;
        var result_line = '';
        for(var i = 0; i < num[1]; i++) {
            var int_result = random(num[0]);
            result += int_result;
            result_line == false ? result_line = int_result : result_line += ' + ' + int_result;
        }
        var full_line = num[0] + 'x' + num[1] + ': ' + result_line + ' = ' + result + '(' + maximum + ')';
        return '<br><span class="roulette">' + full_line + '</span><br>';
    }
    else {
        return num[0] + 'RL' + num[1];
    }
};

function random(max) {
    return Math.floor(Math.random() * (+max + 1));
};

exports.trip = trip;
exports.spam = spam;
exports.ban = ban;
exports.lock = lock;
exports.image = image;
exports.count = posts_count;
exports.require_trip = require_trip;
exports.text = text_processing;