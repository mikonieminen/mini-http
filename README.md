# About #

This is mini-module that implements simple Promise based HTTP request API that allows same code to be used in node.js and inside browsers.

# Restrictions

This requires window.btoa function exist. That basically mandates at least IE10, Firefox 3.6, Google Chrome 7, Safari 5.0.1 or Opera 10.

# Usage #

```javascript
;(function(module) {
    var http = require("mini-http");
    var req = {
        method: "GET",
        hostname: "localhost",
        port: 8080,
        path: "/myPath",
        hash: "myHash",
        query: "prop1=\"val1\"",
        auth: {
            user: "myUser",
            password: "myPassword",
        },
        headers: [{
            "Content-Type": "application/json"
        }]
    };
    http.request(req).then(function (response) {
        // Your code handling successful request
    }, function (reason) {
        // Your code handling failed request
    });

    // There are also get, post, put and delete that
    // define method accordingly
    http.get({ hostname: "localhost" }).then(function (res) {
    }, function (reason) {
    });
    http.post({ hostname: "localhost" }, data).then(function (res) {
    }, function (reason) {
    });
    http.put({ hostname: "localhost" }, data).then(function (res) {
    }, function (reason) {
    });
    http.delete({ hostname: "localhost" }).then(function (res) {
    }, function (reason) {
    });

})(typeof module !== "undefined" ? module : null);
```
