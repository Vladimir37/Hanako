var fo = require('./file_operation');
var boards_cache = require('../data/boards');

//load boards list
function boards_list(req, res, next) {
    fo.read('app/data/boards.json').then(function(boards) {
        res.locals.boards_list = sorting(boards);
        next();
    }, function(err) {
        console.log(err);
        res.locals.boards_list = sorting(boards_cache);
        next();
    });
};

//sorting boards
function sorting(obj) {
    var boards_scheme = {};
    for(board in obj) {
        if(!obj[board].hidden) {
            if (!boards_scheme[obj[board].category]) {
                boards_scheme[obj[board].category] = [];
            }
            boards_scheme[obj[board].category].push([board, obj[board].name]);
        }
    }
    return boards_scheme;
};

module.exports = boards_list;