var db = require('./database');
var errors = require('../routing/errors');
var crypt = require('./admin_crypt');
var processing = require('./post_processing');
var captcha = require('./captcha');
var fo = require('./file_operation');

//RegExp
var re_num = new RegExp('^[0-9]+$');
var re_board = new RegExp('^[a-z0-9]+$');

//reports handling
function report(req, res, next) {
    var admin_id = res.modId;
    var report_id = req.body.id;
    var resolution = req.body.resolution;
    db.reports.update({
        respondent: admin_id,
        resolution: resolution,
        active: 0
    }, {
        where: {
            id: report_id,
            active: 1
        }
    }).then(function() {
        res.redirect('/admin/reports');
    }, function(err) {
        console.log(err);
        errors.e500(req, res, next);
    });
};

//editing spam list
function spam(req, res, next) {
    var board = req.body.board;
    var word = req.body.word;
    fo.read('app/data/spam.json').then(function(spam_list) {
        if(!spam_list[board]) {
            throw new Error('Board not defined');
        }
        var position = spam_list[board].indexOf(word);
        if(position == '-1') {
            spam_list[board].push(word);
        }
        else {
            spam_list[board].splice(position, 1);
        }
        return fo.write('app/data/spam.json', spam_list);
    }).then(function() {
        res.redirect('/admin/spam');
    }).catch(function(err) {
        console.log(err);
        errors.e500(req, res, next);
    });
};

//ban and unban
function ban(req, res, next) {
    var type = req.body.type;
    var respondent = res.modId;
    var time = req.body.time;
    var reason = req.body.reason;
    var board = req.body.board || null;
    switch(type) {
        case "1":
            //ban to IP
            var ip = req.body.ip;
            db.bans.create({
                board: board,
                reason: reason,
                respondent: respondent,
                time: time
            }).then(function() {
                res.redirect('/admin/bans');
            }, function(err) {
                console.log(err);
                errors.e500(req, res, next);
            });
            break;
        case "2":
            //ban to post's ID
            var post_id = req.body.post_id;
            db[board + '_posts'].findById(post_id).then(function(post) {
                if(result) {
                    db.bans.create({
                        board: board,
                        reason: reason,
                        respondent: respondent,
                        time: time
                    });
                    res.redirect('/admin/bans');
                }
                else {
                    errors.e500(req, res, next);
                }
            }, function(err) {
                console.log(err);
                errors.e500(req, res, next);
            });
            break;
        case "3":
            //unban to ID
            var unban_id = req.body.num;
            db.bans.destroy({where: {
                id: unban_id
            }}).then(function() {
                res.redirect('/admin/bans');
            }, function(err) {
                console.log(err);
                errors.e500(req, res, next);
            });
            break;
        default:
            errors.e500(req, res, next);
            break;
    };
};

//operation with boards for admins
function boards(req, res, next) {
    var board_name = req.body.name;
    var bumplimit = req.body.bump;
    var pages = req.body.pages;
    var threads = req.body.threads;
    //board's data
    var board_data = {};
    board_data.name = req.body.public_name;
    board_data.default_username = req.body.username;
    board_data.image_permit = Boolean(req.body.image);
    board_data.trip_permit = Boolean(req.body.tripcode);
    board_data.trip_required = Boolean(req.body.tripcode_require);
    board_data.bumplimit = req.body.bump;
    board_data.pages = req.body.pages;
    board_data.thread_in_page = req.body.threads;
    board_data.hidden = Boolean(req.body.hidden);
    //incorrect data type
    if (!(re_num.test(bumplimit) && re_num.test(pages) && re_num.test(threads && re_board.test(board_name)))) {
        errors.e500(req, res, next);
        return null;
    }
    fo.read('app/data/boards.json').then(function(boards) {
        boards[board_name] = board_data;
        fo.write('app/data/boards.json', boards);
        return fo.read('app/data/spam.json');
    }).then(function(spam_list) {
        spam_list[board_name] = [];
        fo.write('app/data/spam.json', spam_list);
        res.redirect('/admin/boards');
    }).catch(function(err) {
        console.log(err);
        errors.e500(req, res, next);
    });
};

//operation with admins
function admin(req, res, next) {
    if(req.body.id) {
        db.admins.update({
            active: 0
        }, {
            where: {
                id: req.body.id
            }
        }).then(function() {
            res.redirect('/admin/admins');
        }, function(err) {
            console.log(err);
            errors.e500(req, res, next);
        });
    }
    else {
        var name = req.body.name;
        var pass = req.body.pass;
        var status = req.body.status;
        var all_boards = req.body.all_boards;
        var boards = req.body.boards;
        db.admins.findAll({
            where: {
                name: name
            }
        }).then(function(result) {
            if(result.length) {
                res.redirect('/admin/admins#incorrect');
            }
            else {
                var pass_enc = crypt.encrypt(pass);
                var need_board;
                if(all_boards) {
                    need_board = null;
                }
                else {
                    need_board = JSON.stringify(boards) || null;
                }
                return db.admins.create({
                    name: name,
                    pass: pass_enc,
                    status: status,
                    boards: need_board
                });
            }
        }).then(function() {
            res.redirect('/admin/admins');
        }).catch(function(err) {
            console.log(err);
            errors.e500(req, res, next);
        });
    }
};

//creating post and thread
function posting(req, res, next) {
    var board = req.params.name;
    var ip = req.ip;
    //captcha
    var c_key = req.body.c_key;
    var c_value = req.body.c_value;
    //main data
    var name = req.body.name || boards[board].default_username;
    var title = req.body.title || '';
    var text = req.body.text;
    var sage = req.body.sage || 0;
    //processing
    var name_trip = processing.trip(name);
    title = title.substr(0, 40);
    //captcha check
    if(!captcha.check_f(c_key, c_value)) {
        res.end('1');
        return;
    };
    processing.spam(text).then(function() {
        //
    });
    fo.read('app/data/boards.json').then(function(boards) {
        //post to thread
        if (req.params.num) {
            var thread_num = req.params.num;
        }
        //new thread
        else {
            //
        }
    });
};

exports.report = report;
exports.spam = spam;
exports.ban = ban;
exports.boards = boards;
exports.admin = admin;
exports.posting = posting;