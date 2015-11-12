var render = require('./render');
var fo = require('./file_operation');
var errors = require('../routing/errors');

//dashboard
function dashboard(req, res, next) {
    fo.read('app/data/boards.json').then(function(boards) {
        var board_name = req.params.name;
        var page_num = req.params.num;
        if(page_num) {
            if(
                boards[board_name]
                && boards[board_name].pages > page_num
                && page_num >= 0
            ) {
                render.dashboard(req, res, next, board_name, boards[board_name], page_num);
            }
            else {
                errors.e404(req, res, next);
            }
        }
        else {
            if(boards[board_name]) {
                render.dashboard(req, res, next, board_name, boards[board_name]);
            }
            else {
                errors.e404(req, res, next);
            }
        }
    }, function(err) {
        console.log(err);
        errors.e500(req, res, next);
    });
};

exports.dashboard = dashboard;