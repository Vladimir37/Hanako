var jade = require('jade');

var captcha = require('./captcha');
var errors = require('../routing/errors');

//render jade file
function render_jade(name) {
    return function(req, res, next) {
        var variables = {
            c_key: captcha.new()
        };
        res.locals.var3 = '1234';
        res.render(name, variables);
    }
};

exports.jade = render_jade;