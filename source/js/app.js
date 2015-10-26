import React from 'react';
import ReactDOM from 'react-dom';
import EventsType from './classes/EventsType';
var io = require('socket.io-client')();

class Manager extends React.Component{
	constructor(){
		super();
		this.state = {
			initChat: false,
			allConnectedUsers: [],
			connectedUserName: '',
			currentMessages: []
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
				this.setState({ allConnectedUsers: allUsers })
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

		this.peer.on('connection', (conn) => {
			// console.log('connection: ', conn);
			conn.on('open', () => {
				console.log('on connection -> open: ', conn);

				conn.on('data', (data) => {
					// console.log('on data -> data: ', data);
					this.getMessage(data);
				})
			});
		});
	}



	changeConnectedUser(peerID){
		console.log('change user: ', peerID);

		var conn = this.peer.connect(peerID);
		conn.on('open', () => {
			console.log('on open -> send message');
			this.connectedPeer = conn;

			this.setState({
				connectedUserName: conn.peer
			});
			console.log('connectedUserName: ', this.state.connectedUserName);


			// Send messages
			// conn.send('Hello!');
			this.sendMessage('hi how are you!?');
		});
	}

	sendMessage(message){
		console.log('sendMessage: ', message);
		this.connectedPeer.send({
			userName: this.userName,
			message: message
		});
	}

	getMessage(data){
		console.log('getMessage: ', data);
		var messages = this.state.currentMessages;
		messages.push(data.message);
		this.setState({
			currentMessages: messages
		});
	}
}


class ChatApp extends Manager{

	
	sendMessageHandle(){
		// console.log('ref: ', this.refs.messageInput.value);
		this.sendMessage(this.refs.messageInput.value);
		this.refs.messageInput.value = '';
	}

	render(){
		if(this.state.initChat){
			return (
				<div className="container-fluid">
					<div className="row">
						<div className="col-sm-4 users-list">
							<h2>Connected users</h2>
							<UsersList user={ this.userName } users={ this.state.allConnectedUsers } changeConnectedUser={ (peerID) => this.changeConnectedUser(peerID) } />
						</div>
						<div className="col-sm-8 messages-list">
							<div className="col-sm-12">
								<h2>Messages</h2>
								<MessagesList userName={ this.userName } connectedUserName={ this.state.connectedUserName } messages={ this.state.currentMessages } />
							</div>
						</div>
					</div>
					<div className="row">
						<div className="col-sm-8 user-input">
							<input ref="messageInput" className="col-sm-8" type="text" />
							<button className="btn btn-primary" onClick={ () => this.sendMessageHandle() }>Send message</button>
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
	changeConnectedUser(peerID){
		this.props.changeConnectedUser(peerID);
	}

	render(){
		var listItems = [];
		if(typeof this.props.users != 'undefined'){
			this.props.users.forEach((user, index) => {
				if(user.peerID == this.props.user){
					listItems.push(<li key={ index } onClick={ () => this.changeConnectedUser(user.peerID) } className="current-user">your name: { user.peerID }</li>);	
				} else {
					listItems.push(<li key={ index } onClick={ () => this.changeConnectedUser(user.peerID) }>{ user.peerID }</li>);	
				}
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
		var messages = [];
		console.log('this.props.messages: ', this.props.messages);
		if(typeof this.props.messages != 'undefined'){
			this.props.messages.forEach((message, index) => {
				messages.push(
					<li key={ index }><span className="user-name">{ this.props.connectedUserName }: </span>{ message }</li>
				)
			});
		}
		
		return (
			<div>
				<h4>Hello { this.props.userName }</h4>
				<ul>
					{ messages }
				</ul>
			</div>
		)
	}
}

ReactDOM.render(
	<ChatApp />,
	document.getElementById('chatApp')
);