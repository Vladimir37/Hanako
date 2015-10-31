## Use Case

    <a href="img/myimage.jpg"><img src="img/myimage.jpg?tn=150"></a>

## Installation

    $ npm install thumb-express

## Examples

    var rt = require("thumb-express");
    ...
    app.use(rt.init(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname, 'public')));


    http://mydomain.com/myimage.jpg // full image
    http://mydomain.com/myimage.jpg?tn=250 // 250px wide resized image

## Dependencies

Depends on imagemagick

## Credits
This a chopped verison of [quickthumb](https://github.com/zivester/node-quickthumb.git) with elements from
from [node-gallery](http://www.github.com/cianclarke/node-gallery) (or vice versa)
