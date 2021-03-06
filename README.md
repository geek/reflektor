reflektor
=========

Hapi plugin for logging stdout/stderr to browser console

[![Build Status](https://travis-ci.org/wpreul/reflektor.png)](https://travis-ci.org/wpreul/reflektor)

[![NPM](https://nodei.co/npm/reflektor.png?downloads=true&stars=true)](https://nodei.co/npm/reflektor/)


## Require in Hapi

```javascript
var Hapi = require('hapi');

var server = new Hapi.Server();

var options = {
    endpoint: '/debug/terminal'
};

server.require('reflektor', options, function (err) {
...
```

## Usage

Launch a browser and navigate to /debug/terminal under your hapi server.  Open the dev tools and view the
console.  Any writes to the stdout or stderr on the server will be logged to the browser console.

![Example](https://raw.github.com/wpreul/reflektor/master/img/reflektor_screen.png)