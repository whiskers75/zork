// Zork Server by whiskers75

var cp = require('child_process');
var net = require('net');
var readline = require('readline');
var sessions = []
var sockets = []




net.createServer(function(socket) {
    sockets.push(socket);
    sessions[sockets.indexOf(socket)] = cp.spawn('frotz '+process.env.PWD+'/Zork/DATA/ZORK1.DAT'); // Spawn Zork I using frotz
    socket.on('data', function(data) {
        sessions[sockets.indexOf(socket)].stdin.write(data);
    });
    sessions[sockets.indexOf(socket)].stdout.on('data', function(data) {
        socket.write(data);
    });
    sessions[sockets.indexOf(socket)].on('exit', function() {
        socket.end();
    });  
}).listen(5025);