var db = require('./database');
var fo = require('./file_operation');

var boards_stack = {};

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
    }
    console.log(boards_stack);
});