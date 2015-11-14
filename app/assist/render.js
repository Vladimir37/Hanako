var url = require('url');

var db = require('./database');
var captcha = require('./captcha');
var fo = require('./file_operation');
var errors = require('../routing/errors');
var structure = require('./structure');
var stack = require('./stack');

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

//index render
function index(req, res, next) {
    fo.read('app/data/boards.json').then(function(boards) {
        res.render('main/index', {boards: boards});
    }, function(err) {
        console.log(err);
        errors.e500(req, res, next);
    });
};

//render dashboard
function dashboard(req, res, next, board, board_data, page) {
    page = page || 0;
    var variables = {
        posts: all_posts_arr[0],
        count: all_posts_arr[1],
        board: {
            addr: board,
            data: board_data
        }
    };
    res.render('main/dashboard', variables);
};

function thread(req, res, next, boards_data) {
    var board = req.params.name;
    var thread_num = req.params.num;
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
            res.render('main/thread', {
                posts: posts,
                op_post: op_post,
                boards_data: boards_data
            });
        }
        else {
            errors.e404(req, res, next);
        }
    }, function(err) {
        console.log(err);
        errors.e500(req, res, next);
    });
};

exports.jade = render_jade;
exports.reports = reports;
exports.spam = spam;
exports.ban = ban;
exports.boards = boards;
exports.admin = admin;
exports.index = index;
exports.dashboard = dashboard;
exports.thread = thread;