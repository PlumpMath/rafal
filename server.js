var express = require('express');
var app = express();
var PeerServer = require('peer').PeerServer;
var EventsType = require('./source/js/classes/EventsType.js');

app.use(express.static( __dirname + '/build' ));

var expressServer = app.listen(3001);
var io = require('socket.io').listen(expressServer);


var peerServer = new PeerServer({ port: 9000, path: '/chat' });

peerServer.on('connection', function(peerID){
	allConnectedPeers.push( { peerID: peerID } );

	io.emit(EventsType.USER_CONNECTED, peerID);
	// io.emit(EventsType.ALL_CONNECTED_PEERS_LIST, allConnectedPeers);

	console.log('new user connected: ', peerID);
});

peerServer.on('disconnect', function(peerID, index){
	allConnectedPeers.forEach((peer) =>{
		if(peer.peerID == peerID){
			allConnectedPeers.splice(index, 1);
		}
	});

	io.emit(EventsType.USER_DISCONNECTED, peerID);

	console.log('disconnect allConnectedPeers: ', allConnectedPeers);
});

var allConnectedPeers = [];


app.get('/api/allConnectedPeers', function(req, res){
	return res.json(allConnectedPeers);
});