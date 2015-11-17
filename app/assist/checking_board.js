//check rights on board
function board_right(arr, board) {
    if(arr == null) {
        return true;
    }
    else {
        if(typeof arr == 'string') {
            arr = JSON.parse(arr);
        }
        try {
            return arr.indexOf(board) != -1;
        }
        catch(err) {
            console.log(err);
            return false;
        }
    }
};

module.exports = board_right;