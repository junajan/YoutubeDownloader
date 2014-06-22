var sys = require("sys");
var fs = require("fs");
var _ = require('underscore');
var reload = require("reload");
var http = require("http");
var express = require("express");

var app = express();

// konfigurace systemu
require("./config/public")(express, app, __dirname);

// config HTTP server
var server = http.createServer(app);

// reload klienta po 1s pri restartu serveru - JEN PRO DEVELOPMENT
reload(server, app, 1000)

// spustime socket.IO server 
require("./socketServer.js")(server, app);

// pridani obsluhujicich metod pro dane adresy
require("./routes/index")(app);


// start HTTP server
server.listen(app.get('config').PORT, function() {
    console.log('Express server listening on port ' + app.get('config').PORT);
});