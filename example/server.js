var Hapi = require('hapi');

var server = new Hapi.Server(8080);

server.pack.require('../', function (err) {

    if (err) {
        console.error(err);
        return;
    }

    server.start(function () {

        console.log('Example server running at: http://localhost:8080/debug/terminal');
    });
});
