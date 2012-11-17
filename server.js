// Zork Server by whiskers75

var cp = require('child_process');
var net = require('net');
var readline = require('readline');
var sessions = [];
var sockets = [];
var readlines = []




net.createServer(function(socket) {
    sockets.push(socket);
    readlines[sockets.indexOf(socket)] = readline.createInterface(socket, socket);
    sessions[sockets.indexOf(socket)] = cp.spawn('./zork.sh'); // Spawn Zork I using frotz
    readlines[sockets.indexOf(socket)].on('line', function(data) {
        data = data.replace(/[\n\r]/g, '');
        if (data === '') {}
        else {
        sessions[sockets.indexOf(socket)].stdin.write(data);
        }
    });
    sessions[sockets.indexOf(socket)].stdout.on('data', function(data) {
        readlines[sockets.indexOf(socket)].write(data);
    });
    sessions[sockets.indexOf(socket)].on('exit', function() {
        readlines[sockets.indexOf(socket)].end();
        socket.end();
    });  
}).listen(5025);