var rimraf = require('rimraf');

var db = require('./database');
var fo = require('./file_operation');

var boards_stack = {};
var all_board  = [];
var boards_data;

//only num thread
function thread_num(arr) {
    return arr.map(function(item) {
        return item.id;
    });
};

//initialization stack
fo.read('app/data/boards.json').then(function(boards) {
    boards_data = boards;
    for(i in boards) {
        boards_stack[i] = [];
        all_board.push(i);
    }
    all_board.forEach(function(board_name){
        db.boards[board_name].findAll({
            where: {
                thread: null
            },
            order: [['id', 'DESC']]
        }).then(function(threads) {
            boards_stack[board_name] = thread_num(threads);
        }, function(err) {
            console.log(err);
        });
    });
});

//deleting thread
function deleting(board, thread) {
    var num = boards_stack[board].indexOf(thread);
    if(num != -1) {
        boards_stack[board].splice(num, 1);
        rimraf('client/source/img/trd/' + board + '/' + thread, function(err) {
            console.log(err);
        });
        db.boards[board].destroy({where: {
            $or: {
                id: thread,
                thread: thread
            }
        }});
    }
};

//bump thread
function bump(board, thread) {
    var num = boards_stack[board].indexOf(thread);
    if(num != -1) {
        boards_stack[board].unshift(+boards_stack[board].splice(num, 1));
    }
};

//creating new thread
function new_thread(board, thread) {
    boards_stack[board].unsihft(thread);
    var max_value = boards_data[board].pages * boards_data[board].thread_in_page - 1;
    if(boards_stack[board].length > max_value) {
        var drowned = boards_stack[board].slice(max_value);
        drowned.forEach(function(item) {
            deleting(board, item);
        });
    }
};

//need threads
function thread(board, page) {
    var threads_in_page = boards_data[board].thread_in_page;
    var first_thread = boards_data[board].thread_in_page * page;
    var last_thread = first_thread + boards_data[board].thread_in_page;
    return boards_stack[board].slice(first_thread, last_thread);
};

exports.bump = bump;
exports.deleting = deleting;
exports.new = new_thread;
exports.thread = thread;