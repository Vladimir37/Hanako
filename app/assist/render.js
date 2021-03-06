var url = require('url');

var db = require('./database');
var captcha = require('./captcha');
var fo = require('./file_operation');
var errors = require('../routing/errors');
var structure = require('./structure');
var stack = require('./stack');
var api_action = require('./api');

//render jade file
function render_jade(name) {
    return function(req, res, next) {
        var variables = {
            c_key: captcha.new()
        };
        res.render(name, variables);
    }
};

//render reports list (admin)
function reports(req, res, next) {
    var url_parts = url.parse(req.url, true);
    var active = 1;
    if(url_parts.query.active == 'not') {
        active = 0;
    }
    db.reports.findAll({
        where: {
            active: active
        },
        order: [['id', 'DESC']],
        include: [{model: db.admins}]
    }).then(function(reports) {
        var variables = {
            reports: reports,
            active: active,
            count: reports.length
        };
        res.render('admin/reports', variables);
    }, function(err) {
        console.log(err);
        errors.e500(req, res, next);
    });
};

//render spam menu
function spam(req, res, next) {
    fo.read('app/data/spam.json').then(function(spam_list) {
        res.render('admin/spam', {spam: spam_list});
    }, function(err) {
        console.log(err);
        errors.e500(req, res, next);
    });
};

//render ban menu
function ban(req, res, next) {
    var variables = {};
    db.bans.findAll({
        order: [['id', 'DESC']],
        include: [{model: db.admins}]
    }).then(function(bans) {
        variables.bans = bans;
        variables.count = bans.length;
        return fo.read('app/data/boards.json');
    }).then(function(boards) {
        variables.boards = boards;
        res.render('admin/bans', variables);
    }).catch(function() {
        errors.e500(req, res, next);
    });
};

//boards menu
function boards(req, res, next) {
    fo.read('app/data/boards.json').then(function(boards) {
        res.render('admin/boards', {
            boards: boards,
            count: Object.keys(boards).length
        });
    }, function(err) {
        console.log(err);
        errors.e500(req, res, next);
    });
};

//admin menu
function admin(req, res, next) {
    var variables;
    db.admins.findAll({where: {
        active: 1
    }}).then(function(admins) {
        variables = {
            admins: admins,
            count: admins.length
        };
        return fo.read('app/data/boards.json');
    }).then(function(boards) {
        variables.boards = boards;
        res.render('admin/admins', variables);
    }).catch(function(err) {
        console.log(err);
        errors.e500(req, res, next);
    });
};

//render dashboard
function dashboard(req, res, next, data_obj, api) {
    data_obj.page = data_obj.page || 0;
    Promise.all([
        structure.preview(stack.thread(data_obj.board, data_obj.page), data_obj.board),
        structure.count(stack.thread(data_obj.board, data_obj.page), data_obj.board)
    ]).then(function(all_posts_arr) {
        var variables = {
            posts: all_posts_arr[0],
            count: all_posts_arr[1],
            board: {
                addr: data_obj.board,
                data: data_obj.board_data
            }
        };
        if(api) {
            variables.posts.forEach(function(thread) {
                thread[1].ip = 0;
                thread[0].forEach(function(post) {
                    post.ip = 0;
                });
            });
            api_action.returning(res, variables, 0);
        }
        else {
            res.render('main/dashboard', variables);
        }
    }).catch(function(err) {
        console.log(err);
        if(api) {
            api_action.returning(res, 'Server error', 2);
        }
        else {
            errors.e500(req, res, next);
        }
    });
};

function thread(req, res, next, boards_data, api) {
    var board, thread_num;
    if(api) {
        board = req.query_data.board;
        thread_num = req.query_data.num;
    }
    else {
        board = req.params.name;
        thread_num = req.params.num;
    }
    db.boards[board].findAll({
        where: {
            $or: {
                id: thread_num,
                thread: thread_num
            }
        }
    }).then(function(thread) {
        if(thread.length && structure.checking(thread)) {
            var op_post = thread[0];
            var posts = thread.slice(1);
            var variables = {
                posts: posts,
                op_post: op_post,
                boards_data: boards_data
            };
            if(api) {
                variables.op_post.ip = 0;
                variables.posts.forEach(function(post) {
                    post.ip = 0;
                });
                api_action.returning(res, variables, 0);
            }
            else {
                res.render('main/thread', variables);
            }
        }
        else {
            if(api) {
                api_action.returning(res, 'Not found', 1);
            }
            else {
                errors.e404(req, res, next);
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

exports.jade = render_jade;
exports.reports = reports;
exports.spam = spam;
exports.ban = ban;
exports.boards = boards;
exports.admin = admin;
exports.dashboard = dashboard;
exports.thread = thread;