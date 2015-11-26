var pages = require('./pages_checking');

//boards list
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
    //
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