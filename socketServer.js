var colors = require("colors");
var io = require("socket.io");

var SockServer = function(server, app) {

	var API = require("./modules/SocketApi")(app);
    var self = this;

    function init(server, app) {

        // IO socket - rozhrani pro prenos zprav
        io = io.listen(server);

        // trida udrzujici informace o spojeni
        io.sockets.on('connection', function(socket) {

            socket.on('getList', API.call(API.getList, 'getList', socket));
            socket.on('fetchSongs', API.call(API.fetchSongs, 'fetchSongs', socket));
            socket.on('downloadArchive', API.call(API.downloadArchive, 'downloadArchive', socket));

            socket.on('error', function(err) {
                console.log("SocketIO Error: " + err.toString());
            });
        });
    }

    init(server, app);
}


SockServer.instance = null;
module.exports = function(server, app) {

    if (SockServer.instance === null)
        SockServer.instance = new SockServer(server, app);
    return SockServer.instance;
}