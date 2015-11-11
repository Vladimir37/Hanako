var db = require('./database');

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
        return db.boards[board].findAll({
            where: {
                $or: {
                    thread: item,
                    id: item
                }
            },
            limit: 3,
            order: [['id', 'DESC']]
        });
    });
    return Promise.all(promise_arr);
};

exports.distinct = distinct_arr;
exports.preview = preview;