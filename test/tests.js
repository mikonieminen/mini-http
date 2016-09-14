;(function (exports) {
    var Promise = require("mini-promise-aplus").Promise;
    var http = require("../mini-http.js");

    var data = require("./data.js");

    describe("mini-http test suite", function () {
        describe("GET", function () {
            describe("JSON", function () {
                it ("return object when content type is application/json", function (done) {
                    var spec = {
                        hostname: "localhost",
                        port: 8080,
                        path: "/json"
                    };
                    http.get(spec).then(function (response) {
                        if (response.code === 200) {
                            if (response.data && response.data.message == data.jsonMessage.message) {
                                done();
                            } else {
                                done(new Error("Returned data does not mach expected"));
                            }
                        } else {
                            done(new Error("Expecting response code 200, got " + response.code));
                        }
                    }, function (reason) {
                        done(new Error(reason.toString()));
                    });
                });

                it ("return object when content type is application/json with charset parameter", function (done) {
                    var spec = {
                        hostname: "localhost",
                        port: 8080,
                        path: "/json",
                        query: "charset=utf8"
                    };
                    http.get(spec).then(function (response) {
                        if (response.code === 200) {
                            if (response.data && response.data.message == data.jsonMessage.message) {
                                done();
                            } else {
                                done(new Error("Returned data does not mach expected"));
                            }
                        } else {
                            done(new Error("Expecting response code 200, got " + response.code));
                        }
                    }, function (reason) {
                        done(new Error(reason.toString()));
                    });
                });

                it ("empty data", function (done) {
                    var spec = {
                        hostname: "localhost",
                        port: 8080,
                        path: "/json/empty"
                    };
                    http.get(spec).then(function (response) {
                        done();
                    }, function (reason) {
                        done(reason);
                    });
                });
            });

            describe("Authentication", function () {
                it ("HTTP Basic", function (done) {
                    var spec = {
                        hostname: "localhost",
                        port: 8080,
                        path: "/auth",
                        auth: { user: data.user, password: data.password }
                    };
                    http.get(spec).then(function (response) {
                        done();
                    }, function (reason) {
                        done(reason);
                    });
                });

                it ("Missing authentication data", function (done) {
                    var spec = {
                        hostname: "localhost",
                        port: 8080,
                        path: "/auth"
                    };
                    http.get(spec).then(function (response) {
                        done(new Error("Expecting request to fail."));
                    }, function (reason) {
                        done();
                    });
                });
            });
        });

        describe("POST", function () {
            it ("send string", function (done) {
                var spec = {
                    hostname: "localhost",
                    port: 8080,
                    path: "/"
                };

                http.post(spec, data.message).then(function (response) {
                    if (response.code === 204) {
                        done();
                    } else {
                        done(new Error("Expecting 204, got " + response.code));
                    }
                }, function (reason) {
                    done(reason);
                });
            });
            it ("send JSON object", function (done) {
                var spec = {
                    hostname: "localhost",
                    port: 8080,
                    path: "/json",
                    headers: { "content-type": "application/json" }
                };

                http.post(spec, data.jsonMessage).then(function (response) {
                    if (response.code === 204) {
                        done();
                    } else {
                        done(new Error("Expecting 204, got " + response.code));
                    }
                }, function (reason) {
                    done(reason);
                });
            });
            it ("JSON object, add content-type header if missing", function (done) {
                var spec = {
                    hostname: "localhost",
                    port: 8080,
                    path: "/json"
                };

                http.post(spec, data.jsonMessage).then(function (response) {
                    if (response.code === 204) {
                        done();
                    } else {
                        done(new Error("Expecting 204, got " + response.code));
                    }
                }, function (reason) {
                    done(reason);
                });
            });
        });

        describe("PUT", function () {
            it ("send string", function (done) {
                var spec = {
                    hostname: "localhost",
                    port: 8080,
                    path: "/"
                };

                http.put(spec, data.message).then(function (response) {
                    if (response.code === 204) {
                        done();
                    } else {
                        done(new Error("Expecting 204, got " + response.code));
                    }
                }, function (reason) {
                    done(reason);
                });
            });
            it ("send JSON object", function (done) {
                var spec = {
                    hostname: "localhost",
                    port: 8080,
                    path: "/json",
                    headers: { "content-type": "application/json" }
                };

                http.put(spec, data.jsonMessage).then(function (response) {
                    if (response.code === 204) {
                        done();
                    } else {
                        done(new Error("Expecting 204, got " + response.code));
                    }
                }, function (reason) {
                    done(reason);
                });
            });
        });

        describe("DELETE", function () {
            it ("request", function (done) {
                var spec = {
                    hostname: "localhost",
                    port: 8080
                };

                http.delete(spec).then(function (response) {
                    if (response.code === 204) {
                        done();
                    } else {
                        done(new Error("Expecting 204, got " + response.code));
                    }
                }, function (reason) {
                    done(reason);
                });
            });
        });
    });
})(typeof exports !== "undefined" ? exports : this.tests = {});
