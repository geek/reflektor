// Load modules

var Lab = require('lab');
var Hapi = require('hapi');


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
        server.pack.require('../', {}, function (err) {

            expect(err).to.not.exist;
            done();
        });
    });

    it('serves terminal code', function (done) {

        var startServer = function () {

            var server = new Hapi.Server();
            server.pack.require('../', {}, function (err) {

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
});