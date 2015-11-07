//403 generate
function forbidden(req, res, next) {
    var err = new Error('Forbidden');
    err.status = 403;
    next(err);
};

//404 generate
function not_found(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
};

//500 generate
function server_error(req, res, next) {
    var err = new Error('Server Error');
    err.status = 500;
    next(err);
};

//render error
function render_error(err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
    res.render('errors/e' + err.status);
};

exports.e403 = forbidden;
exports.e404 = not_found;
exports.e500 = server_error;
exports.render = render_error;