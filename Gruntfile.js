module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-jshint");

    grunt.loadNpmTasks("grunt-mocha-test");
    grunt.loadNpmTasks("grunt-concurrent");
    grunt.loadNpmTasks("grunt-nodemon");

    grunt.initConfig({
        concurrent: {
            tasks: ["nodemon:test", "watch"],
            options: {
                logConcurrentOutput: true
            }
        },
        mochaTest: {
            src: ["test/tests.js"],
            options: {
                reporter: "spec",
            }
        },
        jshint: {
            files: ["Gruntfile.js", "mini-http.js", "server.js", "test/*.js"],
            options: {
                globals: {
                    console: true,
                    module: true
                }
            }
        },
        watch: {
            tests: {
                files: ["test/tests.js", "test/data.js"],
                tasks: ["test"]
            },
            html: {
                files: ["test/tests.js", "test/data.js", "test/test.html"],
                tasks: ["test"]
            },
            main: {
                files: ["mini-http.js"],
                tasks: ["test"]
            },
            grunt: {
                files: ["Gruntfile.js"],
                tasks: ["test"]
            },
            server: {
                files: ["server.js"],
                tasks: ["test"]
            }
        },
        nodemon: {
            test: {
                script: "server.js",
                options: {
                    watch: ["Gruntfile.js", "server.js", "test/data.js"]
                }
            }
        }
    });

    grunt.registerTask("test", ["jshint", "mochaTest"]);

    grunt.registerTask("default", ["concurrent"]);
};
