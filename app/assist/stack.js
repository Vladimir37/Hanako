var fs = require('fs');

var db = require('./database');
var fo = require('./file_operation');

var boards_stack = {};
var all_board  = [];

//only num thread
function thread_num(arr) {
    return arr.map(function(item) {
        return item.id;
    });
};

//initialization stack
fo.read('app/data/boards.json').then(function(boards) {
    for(i in boards) {
        boards_stack[i] = [];
        all_board.push(i);
    }
    all_board.forEach(function(board_name){
        db.boards[board_name].findAll({
            where: {
                thread: null
            },
            limit: boards[board_name].pages * boards[board_name].thread_in_page,
            order: [['id', 'DESC']]
        }).then(function(threads) {
            boards_stack[board_name] = thread_num(threads);
        }, function(err) {
            console.log(err);
        });
    })
});

function selete_thread(board, thread) {
    var num = boards_stack[board].indexOf(thread);
    if(num != -1) {
        boards_stack[board].splice(num, 1);
        fs.rmdir('client/source/img/trd/' + board + '/' + thread);
        db.boards[board].destroy({where: {
            $or: {
                id: thread,
                thread: thread
            }
        }});
    }
};

setTimeout(function() {
    console.log(boards_stack);
    selete_thread('b', 7);
    console.log(boards_stack);
}, 1000);
