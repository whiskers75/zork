// Zork Server by whiskers75

var cp = require('child_process');
var net = require('net');
var readline = require('readline');
var sessions = []
var sockets = []


var startZork = function(socket) {
    sessions[sockets.indexOf(socket)] = cp.spawn('frotz', process.env.PWD+'/Zork/DATA/ZORK1.DAT'); // Spawn Zork I using frotz
    sessions[sockets.indexOf(socket)].stdout.pipe(socket);
    sessions[sockets.indexOf(socket)].stderr.pipe(socket);
    socket.pipe(sessions[sockets.indexOf(socket)].stdin);
    sessions[sockets.indexOf(socket)].on('exit', function() {
        socket.end();
    });
};


net.createServer(function(socket) {
    sockets.push(socket);
    startZork(socket);   
}).listen(5025);