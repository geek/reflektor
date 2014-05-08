// Load modules

var Ws = require('ws');
var Hoek = require('hoek');


// Declare internals

var internals = {};


internals.defaults = {
    endpoint: '/debug/terminal',
    host: '0.0.0.0',
    port: 0
};


exports.register = function (plugin, options, next) {

    var settings = Hoek.applyToDefaults(internals.defaults, options);

    var server = new plugin.hapi.Server(settings.host, settings.port);
    server.start(function () {

        var template = internals.template(server.info.port);

        plugin.route({
            method: 'GET',
            path: settings.endpoint,
            handler: internals.handler(template)
        });

        var ws = new Ws.Server({ server: server.listener });
        ws.on('connection', function (socket) {

            socket.send('Welcome');
        });

        var oldStdout = process.stdout.write.bind(process.stdout);
        process.stdout.write = function (chunk, encoding) {

            oldStdout(chunk, encoding);
            transmit(chunk);
        };

        var oldStderr = process.stderr.write.bind(process.stderr);
        process.stderr.write = function (chunk, encoding) {

            oldStderr(chunk, encoding);
            transmit(chunk);
        };

        var transmit = function (data) {

            try {
                for (var i = 0, il = ws.clients.length; i < il; ++i) {
                    ws.clients[i].send(data.toString());
                }
            }
            catch (err) {}
        };

        return next();
    });
};


internals.handler = function (template) {

    return function (request, reply) {

        reply(template);
    };
};


internals.template = function (port) {

    return '<!DOCTYPE html><html lang="en"><head><title>Debug Terminal</title>' +
        '<meta http-equiv="Content-Language" content="en-us">' +
        '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' +
        '</head><body>' +
        '<script language="javascript">' +
        'var protocol = window.location.protocol === "https:" ? "wss:" : "ws:"; ' +
        'var port = ' + port + '; ' +
        'var ws = new WebSocket(protocol + "//" + window.location.hostname + ":" + port);' +
        'ws.onmessage = function (event) { console.log(event.data); };' +
        '</script>' +
        '</body></html>';
};
