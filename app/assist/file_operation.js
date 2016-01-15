var fs = require('fs');

//reading file
function read(file) {
    return new Promise(function(resolve, reject) {
        fs.readFile(file, function(err, result) {
            if(err) {
                reject(err);
            }
            else {
                resolve(JSON.parse(result));
            }
        });
    });
};

//writing file
function write(file, text) {
    return new Promise(function(resolve, reject) {
        if(typeof text != 'text') {
            text = JSON.stringify(text, null, '    ');
        }
        fs.open(file, 'w', function(err, descriptor) {
            if(err) {
                reject(err);
            }
            else {
                fs.write(descriptor, text, function(err) {
                    if(err) {
                        reject(err);
                    }
                    else {
                        resolve('Success');
                    }
                })
            }
        });
    });
};

exports.read = read;
exports.write = write;