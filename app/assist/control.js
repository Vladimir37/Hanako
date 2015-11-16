var formidable = require('formidable');
var fs = require('fs');

var db = require('./database');
var errors = require('../routing/errors');
var crypt = require('./admin_crypt');
var processing = require('./post_processing');
var captcha = require('./captcha');
var stack = require('./stack');
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
                ip: ip,
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
                if(post) {
                    db.bans.create({
                        ip: post.ip,
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
    board_data.size = req.body.max_size;
    board_data.hidden = Boolean(req.body.hidden);
    //incorrect data type
    if (!(
        re_num.test(bumplimit)
        && re_num.test(req.body.pages)
        && re_num.test(req.body.bump)
        && re_num.test(req.body.max_size)
        && re_board.test(board_name))) {
        errors.e500(req, res, next);
        return null;
    }
    fo.read('app/data/boards.json').then(function(boards) {
        if(!boards[board_name]) {
            fs.mkdir('client/source/img/trd/' + board_name);
        }
        boards[board_name] = board_data;
        fo.write('app/data/boards.json', boards);
        return fo.read('app/data/spam.json');
    }).then(function(spam_list) {
        if(!spam_list[board_name]) {
            spam_list[board_name] = [];
            fo.write('app/data/spam.json', spam_list);
        }
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

//creating post or thread
function posting(req, res, next) {
    var form = new formidable.IncomingForm({
        uploadDir: "tmp",
        encoding: 'utf-8',
        maxFieldsSize: 2 * 1024 * 1024
    });
    form.parse(req, function(err, fields, files) {
        if(err) {
            console.log(err);
            res.end(6);
            return;
        }
        var board = req.params.name;
        var ip = req.ip;
        var thread = req.params.num || null;
        var image = files.image;
        if(image.size == 0) {
            fs.unlink(image.path);
        }
        //captcha
        var c_key = fields.c_key;
        var c_value = fields.c_value;
        //captcha check
        if (!captcha.check_f(c_key, c_value)) {
            res.end('1');
            return;
        }
        ;
        var boards_data, name, title, text, sage, name_trip, img;
        //loading data
        fo.read('app/data/boards.json').then(function (boards) {
            boards_data = boards;
            //main data
            name = fields.name || boards[board].default_username;
            title = (fields.title || '').substr(0, 40);
            text = fields.text;
            sage = fields.sage || 0;
            //processing
            name_trip = processing.trip(name);
            //checking spam
            return processing.spam(text, board);
        }).then(function () {
            //checking ban
            return processing.ban(ip, board);
        }).then(function () {
            //checking lock thread
            if (thread) {
                return processing.lock(board, thread)
            }
            else {
                return Promise.resolve();
            }
        }).then(function () {
            //image processing
            if(image.size) {
                return processing.image(image, board);
            }
            else {
                return Promise.resolve();
            }
        }).then(function(image_ext) {
            img = image_ext;
            var post_data = {
                title: title,
                name: name_trip.name,
                trip: name_trip.trip,
                text: text,
                thread: thread,
                ip: req.ip,
                sage: sage,
                admin: req.modID || null
            };
            return Promise.all([db.boards[board].create(post_data), processing.count(board, thread)]);
        }).then(function (result) {
            //create thread
            if (!thread) {
                fs.mkdir('client/source/img/trd/' + board + '/' + result[0].id);
                stack.new(board, +result[0].id);
            }
            //create post
            else if (!sage && thread && result[1] < boards_data[board].bumplimit) {
                stack.bump(board, +thread);
            }
            res.end('0');
            var need_thread = result[0].thread || result[0].id;
            if(img) {
                fs.rename(
                    image.path,
                    'client/source/img/trd/' + board + '/' + need_thread + '/' + result[0].id + '.' + img
                );
                db.boards[board].update({
                    image: img
                }, {where: {
                    id: result[0].id
                }})
            }
        }).catch(function (err) {
            console.log(err);
            res.end(err.toString());
        });
    });
};

exports.report = report;
exports.spam = spam;
exports.ban = ban;
exports.boards = boards;
exports.admin = admin;
exports.posting = posting;