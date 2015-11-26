var render = require('./render');
var fo = require('./file_operation');
var errors = require('../routing/errors');
var api_action = require('./api');

//RegExp
var re_num = new RegExp('^[0-9]+$');

//dashboard
function dashboard(req, res, next) {
    var api = arguments[3];
    fo.read('app/data/boards.json').then(function(boards) {
        var board_name, page_num;
        if(api) {
            board_name = req.query_data.board;
            page_num = req.query_data.page;
        }
        else {
            board_name = req.params.name;
            page_num = req.params.num;
        }
        //console.log(board_name);
        //console.log(page_num);
        if(page_num) {
            if(
                boards[board_name]
                && +boards[board_name].pages > page_num
                && page_num >= 0
            ) {
                var data_obj = {
                    board: board_name,
                    board_data: boards[board_name],
                    page:page_num
                };
                render.dashboard(req, res, next, data_obj, api);
            }
            else {
                if(api) {
                    api_action.returning(res, 'Not found', 1);
                }
                else {
                    next();
                }
            }
        }
        else {
            if(boards[board_name]) {
                var data_obj = {
                    board: board_name,
                    board_data: boards[board_name]
                };
                render.dashboard(req, res, next, data_obj, api);
            }
            else {
                if(api) {
                    api_action.returning(res, 'Not found', 1);
                }
                else {
                    next();
                }
            }
        }
    }, function(err) {
        console.log(err);
        if(api) {
            api_action.returning(res, 'Server error', 2);
        }
        else {
            errors.e500(req, res, next);
        }
    });
};

function thread(req, res, next) {
    var api = arguments[3];
    fo.read('app/data/boards.json').then(function(boards) {
        var board_name, thread_num;
        if(api) {
            board_name = req.query_data.board;
            thread_num = req.query_data.num;
        }
        else {
            board_name = req.params.name;
            thread_num = req.params.num;
        }
        if(
            boards[board_name]
            && re_num.test(thread_num)
        ) {
            render.thread(req, res, next, [board_name, boards[board_name].name, boards[board_name].image_permit], api);
        }
        else {
            if(api) {
                api_action.returning(res, 'Not found', 1);
            }
            else {
                errors.e404(req, res, next);
            }
        }
    });
};

//return JSON
function dashboard_api(req, res, next) {
    dashboard(req, res, next, true);
};
function thread_api(req, res, next) {
    thread(req, res, next, true);
};

exports.dashboard = dashboard;
exports.thread = thread;
exports.dashboard_api = dashboard_api;
exports.thread_api = thread_api;