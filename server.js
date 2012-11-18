// Zork Server by whiskers75

var cp = require('child_process');
var net = require('net');
var readline = require('readline');
var sessions = [];
var sockets = [];
var readlines = [];
var fs = require('fs');
var clients = [];
var saveTrue = [];
var Dropbox = require('dropbox');
var dbclient = new Dropbox.Client({
    key: "SAI1IOF4dDA=|VO0WcWKiMXG42YK5EOEcxKQW/TLJhPcCDsqq/TiPHg==",
    sandbox: true
});
dbclient.authDriver(new Dropbox.Drivers.NodeServer(8191));
var startsWith = function(superstr, str) {
    return !superstr.indexOf(str);
};


net.createServer(function(socket) {
    sockets.push(socket);
    socket.write(dbclient.authenticate(function(error, client) {
        if (error) {
            socket.write('DROPBOX ERROR\n');
            socket.end();
        }
        else {
            clients[sockets.indexOf(socket)] = client;
        }
    }));
    clients[sockets.indexOf(socket)].readdir('/', function(error, entries) {
        if (error) {
            socket.write('DROPBOX ERROR\n');
            socket.end();
        }
        else {
            if (entries.join('') === '') {
                // We have no Zork save file
                saveTrue[sockets.indexOf(socket)] = false;
            }
            else {
                // We have a Zork save file
                saveTrue[sockets.indexOf(socket)] = true;
                clients[sockets.indexOf(socket)].readFile('ZORK1.sav', function(error, data) {
                    if (error) {
                        socket.write('ERROR LOADING SAVE FILE FROM DROPBOX\n');
                        socket.end();
                    }
                    else {
                        clients[sockets.indexOf(socket)].getUserInfo(function(error, userInfo) {
                            if (error) {
                                socket.write('ERROR GETTING USER INFO\n');
                                socket.end();
                            }
                            fs.writeFile(clients[sockets.indexOf(socket)].uid + '.sav', data, function(error) {
                                if (error) {
                                    socket.write('ERROR WRITING SAVEFILE\n');
                                    socket.end();
                                }

                                readlines[sockets.indexOf(socket)] = readline.createInterface(socket, socket);
                                sessions[sockets.indexOf(socket)] = cp.spawn('./zork.sh'); // Spawn Zork I using frotz
                                sessions[sockets.indexOf(socket)].stdin.write('restore\n');
                                sessions[sockets.indexOf(socket)].stdin.write(clients[sockets.indexOf(socket)].uid + '.sav\n');
                                readlines[sockets.indexOf(socket)].on('line', function(data) {
                                    data = data.replace(/[\n\r]/g, '');
                                    if (startsWith(data, 'restore')) {
                                        // You can't do that!
                                        socket.write('\n>');
                                    }
                                    else {
                                        if (startsWith(data, 'save')) {
                                            
                                            
                                            sessions[sockets.indexOf(socket)].stdin.write(data);
                                            sessions[sockets.indexOf(socket)].stdin.write(clients[sockets.indexOf(socket)].uid + '.sav\n');
                                            // Save data file
                                            setTimeout(function() {
                                                fs.readFile(clients[sockets.indexOf(socket)].uid + '.sav', function(err, data) {
                                                    if (err) {
                                                        socket.write('\nERROR READING SAVEFILE\n');
                                                        socket.end();
                                                    }
                                                    else {
                                                        clients[sockets.indexOf(socket)].writeFile('ZORK1.sav', data, function(err, stat) {
                                                            if (err) {
                                                                socket.write('\nERROR SAVING TO DROPBOX\n');
                                                                socket.end();
                                                            }
                                                            else {
                                                                // File saved!
                                                            }
                                                        });
                                                    }
                                                });
                                            }, 5000);

                                        }
                                        else {

                                            sessions[sockets.indexOf(socket)].stdin.write(data);
                                        }
                                    }
                                });
                                sessions[sockets.indexOf(socket)].stdout.on('data', function(data) {
                                    readlines[sockets.indexOf(socket)].write(data);
                                });
                                sessions[sockets.indexOf(socket)].on('exit', function() {
                                    readlines[sockets.indexOf(socket)].end();
                                    socket.end();
                                });
                            });
                        });
                    }
                });
            }
        }
    });
}).listen(5025);