;(function (exports) {
    "use strict";

    var fs = require("fs");
    var path = require("path");
    var http = require("http");

    var data = require(__dirname + "/test/data.js");

    var PORT = 8080;

    function staticContent(req, res, next) {
        var filename;
        var mimetype;
        var match;
        var m;
        if ((match = req.url.match(/^\/mocha\/(.*)/)) !== null) {
            m = require.resolve("mocha");
            filename = path.dirname(m) + "/" + match[1];
            if (match[1] === "mocha.js") {
                mimetype = "application/javascript";
            } else {
                mimetype = "text/css";
            }
        } else if ((match = req.url.match(/^\/mini-http\.js/)) !== null) {
            filename = __dirname + "/mini-http.js";
            mimetype = "application/javascript";
        } else if ((match = req.url.match(/^\/(mini-.*)\.js/)) !== null) {
            filename = require.resolve(match[1]);
            mimetype = "application/javascript";
        } else if ((match = req.url.match(/^\/test\/tests\.js/)) !== null) {
            filename = __dirname + "/test/tests.js";
            mimetype = "application/javascript";
        } else if ((match = req.url.match(/^\/test\/data\.js/)) !== null) {
            filename = __dirname + "/test/data.js";
            mimetype = "application/javascript";
        } else if ((match = req.url.match(/^\/test\/test\.html/)) !== null) {
            filename = __dirname + "/test/test.html";
            mimetype = "text/html";
        }

        if (filename) {
            fs.exists(filename, function (exists) {
                if (exists) {
                    var fileStream = fs.createReadStream(filename);

                    res.writeHead(200, { "Content-Type": mimetype });

                    fileStream.on('data', function (data) {
                        res.write(data);
                    });

                    fileStream.on('end', function() {
                        res.end();
                    });
                } else {
                    next();
                }
            });
        } else {
            next();
        }
    }

    function handleRequest(req, res) {
        var url = req.url;
        var headers = req.headers;
        var json = false;
        var empty = false;
        var body = "";

        if (url.match(/^\/auth/)) {
            if (!headers.authorization && !headers.Authorization) {
                res.writeHead(401);
                res.end();
                return;
            } else {
                var header = headers.authorization ? headers.authorization : headers.Authorization;
                var token = headers.authorization.split(/\s+/).pop();
                var auth = new Buffer(token, 'base64').toString();
                var parts = auth.split(/:/);
                var user = parts[0];
                var passwd = parts[1];
                if (user != data.user || passwd != data.password) {
                    res.writeHead(401);
                    res.end();
                    return;
                }
            }
        }

        if (url.match(/^(\/auth)?\/json(\/empty)?/)) {
            json = true;
        }

        if (url.match(/^(\/auth)?(\/json)?\/empty/))  {
            empty = true;
        }

        switch (req.method) {
        case "GET":
            if (empty) {
                if (json) {
                    res.writeHead(204, { "content-type": "application/json" });
                } else {
                    res.writeHead(204);
                }
            } else {
                if (json) {
                    res.writeHead(200, { "content-type": "application/json" });
                    res.write(JSON.stringify(data.jsonMessage, null, '\t'));
                } else {
                    res.write(data.message);
                }
            }
            res.end();
            break;
        case "POST":

            req.on("data", function (data) {
                body += data;
            });

            req.on("end", function () {
                if (json) {
                    try {
                        body = JSON.parse(body);
                        if (body.message == data.jsonMessage.message) {
                            res.writeHead(204);
                            res.end();
                        } else {
                            res.writeHead(400);
                            res.end("Message does not match expected");
                        }
                    } catch (e) {
                        res.writeHead(400);
                        res.end("Failed to parse message");
                    }
                } else {
                    if (body === data.message) {
                        res.writeHead(204);
                        res.end();
                    } else {
                        res.writeHead(400);
                        res.end();
                    }
                }
            });

            req.on("error", function (err) {
                res.writeHead(500);
                res.end();
            });

            break;
        case "PUT":

            req.on("data", function (data) {
                body += data;
            });

            req.on("end", function () {
                if (json) {
                    try {
                        body = JSON.parse(body);
                        if (body.message == data.jsonMessage.message) {
                            res.writeHead(204);
                            res.end();
                        } else {
                            res.writeHead(400);
                            res.end("Message does not match expected");
                        }
                    } catch (e) {
                        res.writeHead(400);
                        res.end("Failed to parse message");
                    }
                } else {
                    if (body === data.message) {
                        res.writeHead(204);
                        res.end();
                    } else {
                        res.writeHead(400);
                        res.end();
                    }
                }
            });

            req.on("error", function (err) {
                res.writeHead(500);
                res.end();
            });

            break;
        case "DELETE":
            res.writeHead(204);
            res.end();
            break;
        default:
            res.writeHead(400);
            res.end("Unsupported request");
            break;
        }
    }

    var app = function (req, res) {
        staticContent(req, res, function () {
            handleRequest(req, res);
        });
    };

    var server = http.createServer(app).listen(PORT);
})();