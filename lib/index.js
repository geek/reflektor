// Load modules

var Ws = require('ws');
var Hoek = require('hoek');


// Declare internals

var internals = {
    webSockets: []
};


internals.defaults = {
    endpoint: '/debug/terminal'
};


exports.register = function (plugin, options, next) {

    var settings = Hoek.applyToDefaults(internals.defaults, options);
    plugin.route({
        method: 'GET',
        path: settings.endpoint,
        handler: internals.handler
    });

    for (var i = 0, il = plugin.servers.length; i < il; ++i) {
        registerServer(plugin.servers[i]);
    }

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

    return next();
};


var registerServer = function (server) {

    var ws = new Ws.Server({ server: server.listener, path: '/reflektor' });
    ws.on('connection', function (socket) {

        socket.send('Welcome');
    });

    internals.webSockets.push(ws);
};


var transmit = function (data) {

    try {
        internals.webSockets.forEach(function (ws) {

            for (var i = 0, il = ws.clients.length; i < il; ++i) {
                ws.clients[i].send(data.toString());
            }
        });
    }
    catch (err) {}
};


internals.handler = function (request, reply) {

    reply(internals.template);
};


internals.template = '<!DOCTYPE html><html lang="en"><head><title>Debug Terminal</title>' +
    '<meta http-equiv="Content-Language" content="en-us">' +
    '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' +
    '</head><body>' +
    '<script language="javascript">' +
    'var protocol = window.location.protocol === "https:" ? "wss:" : "ws:"; ' +
    'var ws = new WebSocket(protocol + "//" + window.location.host + "/reflektor");' +
    'ws.onmessage = function (event) { console.log(event.data); };' +
    '</script>' +
    '</body></html>';
