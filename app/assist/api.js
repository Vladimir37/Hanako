var pages = require('./pages_checking');
var db = require('./database');
var boards_list = require('../data/boards');

//return boards list
function boards(req, res, next) {
    returning(res, res.locals.boards_list, 0);
};

//dashboard
function dashboard(req, res, next) {
    pages.dashboard_api(req, res, next);
};

//one thread
function thread(req, res, next) {
    pages.thread_api(req, res, next);
};

//one post
function post(req, res, next) {
    var board = req.query_data.board;
    var num_post = req.query_data.num;
    if(!boards_list[board]) {
        returning(res, 'Not found', 1);
    }
    else {
        db.boards[board].findById(num_post).then(function (result) {
            if (result) {
                result.ip = 0;
                returning(res, result, 0);
            }
            else {
                returning(res, 'Not found', 1);
            }
        }, function (err) {
            console.log(err);
            returning(res, 'Server error', 2);
        });
    }
};

//returning result
function returning(res, obj, status) {
    res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
    var result = {};
    result.status = status;
    result.body = obj;
    res.end(JSON.stringify(result));
};

exports.boards = boards;
exports.dashboard = dashboard;
exports.thread = thread;
exports.post = post;
exports.returning = returning;