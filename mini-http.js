;(function (module) {
    var request = null;

    var Promise = require("mini-promise").Promise;

    function RequestSpecification(spec) {
        var self = this;

        this.method = spec.method ? spec.method : "GET";
        this.scheme = spec.scheme ? spec.scheme : (spec.protocol ? spec.protocol : "http");
        this.domain = spec.domain ? spec.domain : (spec.hostname ? spec.hostname : null);
        this.port = spec.port ? spec.port : null;
        this.path = spec.path ? spec.path : null;
        this.query_string = spec.query_string ? spec.query_path : (spec.query ? spec.query : null);
        this.fragment_id = spec.fragment_id ? spec.fragment_id : (spec.fragment ? spec.fragment : (spec.hash ? spec.hash : null));
        this.auth = spec.auth ? spec.auth : null;
        this.headers = (spec.headers) ? spec.headers : {};

        Object.defineProperty(this, "query", {
            configurable: false,
            enumerable: false,
            get: function () {
                return self.query_string;
            },
            set: function (val) {
                self.query_string = val;
                return val;
            }
        });

        Object.defineProperty(this, "fragment", {
            configurable: false,
            enumerable: false,
            get: function () {
                return self.fragment_id;
            },
            set: function (val) {
                self.fragment_id = val;
                return val;
            }
        });

        Object.defineProperty(this, "hash", {
            configurable: false,
            enumerable: false,
            get: function () {
                return self.fragment_id;
            },
            set: function (val) {
                self.fragment_id = val;
                return val;
            }
        });
    }

    function Response(code, data, headers) {
        this.code = code;
        this.data = data;
        this.headers = headers;
    }


    if (typeof window != "undefined") {
        if (!window.btoa instanceof Function) {
            throw new Error("Browser lacking support for window.btoa, bailing out");
        }
        request = function (spec, data) {
            return new Promise(function (resolve, reject) {
                if (!(spec instanceof RequestSpecification)) {
                    spec = new RequestSpecification(spec);
                }
                var url =
                        (spec.scheme ? spec.scheme + ":" : window.location.protocol) + "//" +
                        (spec.domain ? spec.domain : window.location.hostname) +
                        (spec.port ? (":" + spec.port) : (":" + window.location.port)) +
                        (spec.path ? spec.path : "") +
                        (spec.query ? ("?" + spec.query) : "") +
                        (spec.hash ? ("#" + spec.hash) : "");
                var req = new XMLHttpRequest();
                req.open(spec.method, url, true);
                if (spec.headers) {
                    for (var prop in spec.headers) {
                        try {
                            req.setRequestHeader(prop, spec.headers[prop]);
                        } catch (e) {
                            console.error("Error while setting request header: " + e);
                            console.error(e.stack);
                            throw e;
                        }
                    }
                }
                if (spec.auth) {
                    if (spec.auth.user && spec.auth.password) {
                        req.setRequestHeader("Authorization", "Basic " + window.btoa(spec.auth.user + ":" + spec.auth.password));
                        req.withCredentials = "true";
                    } else if (spec.auth.user) {
                        req.setRequestHeader("Authorization", "Basic " + window.btoa(spec.auth.user));
                        req.withCredentials = "true";
                    }
                }
                if (data && typeof data != "string") {
                    (function () {
                        var found = false;
                        for (var key in spec.headers) {
                            if (key.toLowerCase() == "content-type") {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            req.setRequestHeader("Content-Type", "application/json");
                        }
                    })();
                }
                req.onreadystatechange = function() {
                    var data;
                    var err;
                    if (req.readyState == 4) {
                        if (req.status !== 204 && req.status >= 200 && req.status < 300) {
                            if (req.getResponseHeader("content-type") === "application/json") {
                                try {
                                    data = JSON.parse(req.responseText);
                                } catch (e) {
                                    console.error("Error parsin JSON data into an object: " + e);
                                    console.error(e.stack);
                                    reject (e);
                                }
                                resolve(new Response(req.status, data, req.getAllResponseHeaders()));
                            } else {
                                resolve(new Response(req.status, req.responseText, req.getAllResponseHeaders()));
                            }
                        } else  if (req.status === 204) {
                            resolve(new Response(req.status, null, req.getAllResponseHeaders()));
                        } else {
                            if (req.getResponseHeader("content-type") === "application/json") {
                                try {
                                    data = JSON.parse(req.responseText);
                                    err = new Error("Server returned: " + req.status);
                                    err.data = data;
                                    err.code = req.status;
                                    err.headers = req.getAllResponseHeaders();
                                    reject(err);
                                } catch (e) {
                                    console.error("Error parsin JSON data into an object: " + e);
                                    console.error(e.stack);
                                    reject(e);
                                }
                            } else {
                                err = new Error("Server returned: " + req.status);
                                err.data = req.responseText;
                                err.code = req.status;
                                err.headers = req.getAllResponseHeaders();
                                reject(err);
                            }
                        }
                    }
                };
                if (data) {
                    req.send(typeof data === "string" ? data : JSON.stringify(data));
                } else {
                    req.send();
                }
            });
        };
    } else {
        request = function (spec, data) {
            return new Promise(function (resolve, reject) {
                if (!(spec instanceof RequestSpecification)) {
                    spec = new RequestSpecification(spec);
                }
                console.assert(spec.domain, new Error("Missing hostname or IP address"));
                if (spec.auth) {
                    if (spec.auth.user && spec.auth.password) {
                        spec.headers.Authorization = "Basic " + new Buffer(spec.auth.user + ":" + spec.auth.password).toString("base64");
                    } else if (spec.auth.user) {
                        spec.headers.Authorization = "Basic " + new Buffer(spec.auth.user).toString("base64");
                    }
                }
                if (data && typeof data != "string") {
                    (function () {
                        var found = false;
                        for (var key in spec.headers) {
                            if (key.toLowerCase() == "content-type") {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            spec.headers["Content-Type"] = "application/json";
                        }
                    })();
                }
                var impl = spec.schema === "https" ? require("https") : require("http");
                var req = impl.request(spec, function(res) {
                    var data = "";
                    res.setEncoding('utf8');
                    res.on('data', function (chunk) {
                        data += chunk;
                    });
                    res.on('end', function () {
                        var parse;
                        var err;
                        if (res.statusCode !== 204 && res.statusCode >= 200 && res.statusCode < 300) {
                            if (res.headers["content-type"] === "application/json") {
                                try {
                                    parsed = JSON.parse(data);
                                } catch (e) {
                                    reject (e);
                                }
                                resolve(new Response(res.statusCode, parsed, res.headers));
                            } else {
                                resolve(new Response(res.statusCode, data, res.headers));
                            }
                        } else if (res.statusCode === 204) {
                            resolve(new Response(res.statusCode, null, res.headers));
                        } else {
                            if (res.headers["content-type"] === "application/json") {
                                if (data && data.length > 0) {
                                    try {
                                        parsed = JSON.parse(data);
                                        err = new Error("Server returned: " + res.statusCode);
                                        err.data = parsed;
                                        err.code = res.statusCode;
                                        err.headers = res.headers;
                                        reject(err);
                                    } catch (e) {
                                        reject(e);
                                    }
                                } else {
                                    err = new Error("Server returned: " + res.statusCode);
                                    err.data = data;
                                    err.code = res.statusCode;
                                    err.headers = res.headers;
                                    reject(err);
                                }
                            } else {
                                err = new Error("Server returned: " + res.statusCode);
                                err.data = data;
                                err.code = res.statusCode;
                                err.headers = res.headers;
                                reject(err);
                            }
                        }
                    });
                });
                req.on('error', function(e) {
                    console.error("Projects.get, got error: ", e);
                    reject(e);
                });
                if (data) {
                    req.write(typeof data == "string" ? data : JSON.stringify(data));
                }
                req.end();
            });
        };
    }

    function http() {
    }

    http.RequestSpecification = RequestSpecification;
    http.Response = Response;

    http.request = request;

    http.get = function (spec) {
        spec.method = "GET";
        return http.request(spec);
    };

    http.put = function (spec, data) {
        spec.method = "PUT";
        return http.request(spec, data);
    };

    http.post = function (spec, data) {
        spec.method = "POST";
        return http.request(spec, data);
    };

    http.delete = function (spec) {
        spec.method = "DELETE";
        return http.request(spec);
    };

    module.exports = http;

})(typeof module !== "undefined" ? module : null);
