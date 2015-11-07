var jade = require('jade');

var errors = require('../routing/errors');

//render jade file
function render_jade(name) {
    return function(req, res, next) {
        res.render(name);
    }
};

exports.jade = render_jade;