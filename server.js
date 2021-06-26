var fs = require('fs');
var path = require('path');
var http = require('http');
http.createServer(handleRequest).listen(8124, "127.0.0.1");


function handleRequest(req, res) {
    try {
        console.log(req.url);
        dispatch(req, res);
    } catch (err) {
        console.log(err);
    }
}

const dispatch = function(request, response) {
    //set the base path so files are served relative to index.html
    var basePath = "J:/texturelab";
    var filePath = basePath + request.url;

    var contentType = 'text/html';
    var extname = path.extname('filePath');
    //get right Content-Type
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }



    //Write the file to response
    fs.readFile(filePath, function(error, content) {
        if (error) {
            response.writeHead(500);
            response.end();
        } else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });

}