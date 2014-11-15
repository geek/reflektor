// Load modules

var Lab = require('lab');
var Hapi = require('hapi');
var Ws = require('ws');
var Reflektor = require('../');


// Declare internals

var internals = {};


// Test shortcuts

var expect = Lab.expect;
var before = Lab.before;
var after = Lab.after;
var describe = Lab.experiment;
var it = Lab.test;


describe('reflektor', function () {

    it('can be required by hapi', function (done) {

        var server = new Hapi.Server();
        server.pack.register(Reflektor, function (err) {

            expect(err).to.not.exist;
            done();
        });
    });

    it('serves terminal code', function (done) {

        var startServer = function () {

            var server = new Hapi.Server(0);
            server.pack.register({ plugin: Reflektor, options: {} }, function (err) {

                expect(err).to.not.exist;
                requestTerminal(server);
            });
        };

        var requestTerminal = function (server) {

            server.inject({ url: '/debug/terminal'}, function (res) {

                expect(res.result).to.contain('WebSocket');
                done();
            });
        };

        startServer();
    });

    it('accepts connection on websocket port and logs errors', function (done) {

        var startServer = function () {

            var server = new Hapi.Server(0);
            server.pack.register({ plugin: Reflektor, options: {} }, function (err) {

                expect(err).to.not.exist;
                server.start(function () {

                    requestTerminal(server);
                });
            });
        };

        var requestTerminal = function (server) {

            server.inject({ url: '/debug/terminal'}, function (res) {

                var ws = new Ws('ws://localhost:' + server.info.port + '/reflektor');

                var ct = 0;
                ws.on('message', function (data, flags) {

                    if (ct === 0) {
                        expect(data).to.equal('Welcome');
                        ct++;
                        return;
                    }
                    else {
                        expect(data).to.equal('From Test');

                        ws.close();
                    }
                });

                ws.once('open', function () {

                    setTimeout(function () {

                        process.stderr.write('From Test');
                    }, 50);
                });

                ws.once('close', function () {

                    done();
                });
            });
        };

        startServer();
    });
});