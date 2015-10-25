import React from 'react';
import ReactDOM from 'react-dom';
import EventsType from './classes/EventsType';
var io = require('socket.io-client')();

class Manager extends React.Component{
	constructor(){
		super();
		this.state = {
			initChat: false,
			allConnectedPeers: [],
			targetUser: ''
		};

		io.on('connect', () => {
			console.log('io connected');
			io.on(EventsType.USER_CONNECTED, (connectedUserName) => {

				if(this.userName == connectedUserName){
					return;
				}

				console.log('USER_CONNECTED: ', connectedUserName);
			});

			io.on(EventsType.ALL_CONNECTED_PEERS_LIST, (allUsers) => {
				console.log('ALL_CONNECTED_PEERS_LIST: ', allUsers);
				this.setState({ allConnectedPeers: allUsers })
			});
		});
	}

	_getUserName(){
		this.userName = prompt('your name: ');
		if(!this.userName.length){
			this._getUserName();
		} else {
			this._initChat();
		}
	}

	_initChat(){
		this.setState({
			initChat: true
		});

		this._connectToServer();
	}


	_connectToServer(){
		this.peer = new Peer(this.userName, { host: location.hostname, port: 9000, path: '/chat'});

		this.peer.on('connection', function(conn){
			console.log('connection: ', conn);
			conn.send('test message!');
		});
	}
}


class ChatApp extends Manager{

	changeTargetUser(peerID){
		console.log('change user: ', peerID);
		var conn = this.peer.connect(peerID, {
			serialization: 'none'
		});
		conn.on('open', function() {
			console.log('on open');
			
			// Receive messages
			conn.on('data', function(data) {
				console.log('Received', data);
			});			

			// Send messages
			conn.send('Hello!');
		});
	}

	render(){
		if(this.state.initChat){
			return (
				<div className="container-fluid">
					<div className="row">
						<div className="col-sm-4 users-list">
							<h2>Connected users</h2>
							<UsersList users={ this.state.allConnectedPeers } changeTargetUser={ (peerID) => this.changeTargetUser(peerID) } />
						</div>
						<div className="col-sm-8 messages-list">
							<div className="col-sm-12">
								<h2>Messages</h2>
								<MessagesList userName={ this.userName } targetUser={ this.state.targetUser } />
							</div>
						</div>
					</div>
					<div className="row">
						<div className="col-sm-8 user-input">
							<input className="col-sm-8" type="text" />
							<button className="btn btn-primary">Send message</button>
						</div>
					</div>
				</div>
			);
		} else {
			return (
				<button className="btn btn-primary" onClick={ () => this._getUserName() }>
					Open chat
				</button>
			)
		}		
	}
}

class UsersList extends React.Component{
	changeTargetUser(peerID){
		this.props.changeTargetUser(peerID);
	}

	render(){
		var listItems = [];
		if(typeof this.props.users != 'undefined'){
			this.props.users.forEach((user, index) => {
				listItems.push(<li key={ index } onClick={ () => this.changeTargetUser(user.peerID) }>{ user.peerID }</li>);		
			})
		}
		
		return (
			<ul>
				{ listItems }
			</ul>
		)
	}
}

class MessagesList extends React.Component{
	render(){
		return (
			<div>
				<h4>Hello { this.props.userName }, you writting to: { this.props.targetUser }</h4>
				<ul>
					<li></li>
				</ul>
			</div>
		)
	}
}

ReactDOM.render(
	<ChatApp />,
	document.getElementById('chatApp')
);