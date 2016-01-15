var db = require('./database');

function unban_check() {
    db.bans.findAll().then(function(bans){
        var today = new Date();
        bans.forEach(function(item) {
            var ban_date = new Date(item.createdAt);
            var unban_date = new Date();
            unban_date.setDate(ban_date.getDate() + item.time);
            if(today >= unban_date) {
                db.bans.destroy({
                    where: {
                        id: item.id
                    }
                });
            }
        });
    }, function(err) {
        console.log(err);
    });
};

module.exports = unban_check;