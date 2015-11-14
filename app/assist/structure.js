var errors = require('../routing/errors');
var db = require('./database');
var fo = require('./file_operation');

//distinct objects to array
function distinct_arr(arr) {
    for(i in arr) {
        arr[i] = arr[i].DISTINCT;
    };
    return arr;
};

//posts for threads in page
function preview(arr, board) {
    var promise_arr = arr.map(function(item) {
        var db_requests = [];
        db_requests[0] = db.boards[board].findAll({
            where: {
                    thread: item
            },
            limit: 3,
            order: [['id', 'DESC']]
        });
        db_requests[1] = db.boards[board].findOne({
            where: {
                id: item
            }
        });
        return Promise.all(db_requests);
    });
    return Promise.all(promise_arr);
};

//count posts in threads
function count(arr, board) {
    var promise_count = arr.map(function(item) {
        return db.boards[board].count({
            where: {
                $or: {
                    thread: item,
                    id: item
                }
            }
        });
    });
    return Promise.all(promise_count);
};

function thread_checking(arr) {
    return Boolean(!arr[0].thread);
};

exports.distinct = distinct_arr;
exports.preview = preview;
exports.count = count;
exports.checking = thread_checking;