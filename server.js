'use strict';
require("babel-polyfill");

let http = require('http');
let express = require('express');
let socketio = require('socket.io');
let main = require('./main');

let app = express();
let server = http.Server(app);
let io = socketio(server);

var COMMANDLINE = 'commandline';
var COMMANDLINEREQUEST = 'cmlr'; 
var UPDATECARDS = 'updatecards';

var p1, p2;


//**************************************************
//					CONSTANTS
//**************************************************


io.on('connection', onConnection);
app.use(express.static(__dirname + "/client"));
server.listen(8080, () => console.log("Connected!")); 

//after everything happens this is where everything will happen.
function onConnection(sock) {
	io.emit(COMMANDLINE, 'New Player Connected!');

	if (p1 && p2) {
		sock.emit(COMMANDLINE, "Cannot connect.");
	} else if (p1) { //if there is a first player.
		io.emit(COMMANDLINE, "2 Players Connected. Starting Game.");
		p2 = sock;
		main.startGame(io, p1, p2);

		p1.on('disconnect', function() {
			p1 = false;
			p2 = false;
		});

		p2.on('disconnect', function() {
			p1 = false;
			p2 = false;
		});

	} else {
		io.emit(COMMANDLINE, "1 Player Connected. Waiting...");
		p1 = sock;
		sock.emit(UPDATECARDS, [ [], [] ]);
	}

}