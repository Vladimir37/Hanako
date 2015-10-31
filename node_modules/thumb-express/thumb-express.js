"use strict";

var im = require('imagemagick'),
    fs = require('fs'),
    path = require('path');


module.exports  = {
    imageCache : {},
    init : function (base) {
        // 'base' holds the relative path where this module will lookup for the requested files
        // in most cases the express public folder will be used as the base
        // but other value are fine as well

        var me = this,
            root = path.normalize(base);

        return function(req, res, next) {

            var file = req.url.replace(/\?tn.*/, ''),
                dim = req.query.tn || "",
                orig = path.normalize(root + file);

            if (!dim) {
                // not a thumbnail, let the request go to the next middleware
                return next();
            }
            /// there is a query string for the tn parameter
            //  moving on


            // check the cache first
            if (me.imageCache[orig]) {
                res.contentType('image/jpg');
                res.end(me.imageCache[orig], 'binary');
            } else {
                fs.readFile(orig, 'binary', function (err, file) {
                    if (err) {
                        return res.send(err);
                    }
                    var opts = {
                        srcData : file,
                        width : dim
                    };
                    im.resize(opts, function (err, binary, error) {
                        if (error) {
                            res.send('error generating thumb');
                        } else {
                            res.contentType('image/jpg');
                            res.end(binary, 'binary');
                            me.imageCache[orig] = binary;
                        }
                    });
                });
            }
        };
    }
}
