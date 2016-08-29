;(function (exports) {
    "use strict";

    var fs = require("fs");
    var path = require("path");
    var http = require("http");
    var mocha = require("mocha");

    var connect = require("connect");
    var Router = require("mini-router").Router;

    var Promise = require("mini-promise-aplus").Promise;

    var data = require(__dirname + "/test/data.js");

    var PORT = 8080;

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

    new Promise(function (resolve, reject) {
        var router = new Router("TestRouter");
        resolve(router);
    }).then(function (router) {
        var m = require.resolve("mocha");
        router.static("/mocha/mocha.css", path.dirname(m) + "/mocha.css");
        router.static("/mocha/mocha.js", path.dirname(m) + "/mocha.js");
        router.static("/mini-promise.js", require.resolve("mini-promise-aplus"));
        router.static("/mini-module.js", require.resolve("mini-module"));
        router.static("/mini-http.js", "./mini-http.js");
        router.static("/test", "./test/");
        router.add(["GET", "POST", "PUT", "DELETE"], "/", handleRequest);
        router.add(["GET", "POST", "PUT", "DELETE"], "/json", handleRequest);
        router.add(["GET", "POST", "PUT", "DELETE"], "/json/empty", handleRequest);
        router.add(["GET", "POST", "PUT", "DELETE"], "/auth", handleRequest);
        return router;
    }).then(function (router) {
        var app = connect();
        app.use(router.connect());
        return app;
    }).then(function (app) {
        http.createServer(app).listen(PORT);
        console.log("Ready for requests");
    }, function (reason) {
        console.error("Failed to start server: ", reason);
    });
})();
