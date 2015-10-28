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
			currentMessages: [],
            allNotifications: []
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
			conn.on('open', () => {
				console.log('on connection -> open: ', conn);

				conn.on('data', (data) => {
					this.getMessage(data);
				});
			});
		});
	}

    addNotification(notification){
        if(this.state.connectedUserName != notification){
            var notifications = this.state.allNotifications;
            if(notifications.indexOf(notification) == -1){
                notifications.push(notification);
                this.setState({
                    allNotifications: notifications
                });
                console.log('new notification added -> notifications: ', notifications);
            }
        }
    }

    removeNotification(notification){
        var notifications = this.state.allNotifications;
        notifications.forEach((notify, index) => {
            if(notify == notification){
                notifications.splice(index, 1);
                this.setState({
                    allNotifications: notifications
                });
                return;
            }
        });
    }

	changeConnectedUser(peerID){
		var conn = this.peer.connect(peerID);
		conn.on('open', () => {
            console.log('changed user: ', conn.peer);
			this.connectedPeer = conn;

			this.setState({
				connectedUserName: conn.peer
			});

            this.removeNotification(conn.peer);
		});
	}

	sendMessage(message){
        if(message != ''){
            this.connectedPeer.send({
                message: message,
                userName: this.userName
            });

            this.addMessageToHistory(message);
        }
	}

	getMessage(data){
        this.addMessageToHistory(data.message, data.userName);
        this.addNotification(data.userName);
	}

    addMessageToHistory(msg, username){
        var messages = this.state.currentMessages;
        var isSelfMessage = false;

        if(typeof username == 'undefined'){
            var username = this.state.connectedUserName;
            isSelfMessage = true;
        }

        // first message with this user
        if(typeof messages[username] == 'undefined'){
            messages[username] = {
                data: []
            };
        }

        messages[username].data.push({
            msg: msg,
            isSelfMessage: isSelfMessage
        });

        this.setState({
            currentMessages: messages
        });

        console.log('addMessageToHistory: ', messages);
    }
}


class ChatApp extends Manager{
	sendMessageHandle(){
		this.sendMessage(this.refs.messageInput.value);
		this.refs.messageInput.value = '';
	}

	render(){
		if(this.state.initChat){
			return (
				<div className="container-fluid">
					<div className="row">
						<div className="col-sm-4 users-list">
                            <h6>Hello {this.userName }</h6>
                            <hr/>
							<h6>Connected users</h6>
							<UsersList user={ this.userName } users={ this.state.allConnectedUsers } allNotifications={ this.state.allNotifications } connectedUserName={ this.state.connectedUserName } changeConnectedUser={ (peerID) => this.changeConnectedUser(peerID) } />
						</div>
						<div className="col-sm-8 messages-list">
							<div className="col-sm-12">
								<MessagesList connectedUserName={ this.state.connectedUserName } messages={ this.state.currentMessages[this.state.connectedUserName] } />
							</div>
						</div>
					</div>
					<div className="row">
						<div className="col-sm-8 user-input">
							<input ref="messageInput" className="col-sm-8" type="text" onKeyDown={ (evt) => { if(evt.keyCode == 13) this.sendMessageHandle() } } />
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
				if(user.peerID != this.props.user){

                    let classes = this.props.connectedUserName == user.peerID? 'connected-user': '';
                    console.log('this.props.allNotifications: ', this.props.allNotifications);
                    console.log('user.peerID: ', user.peerID);
                    console.log('this.props.allNotifications.indexOf(this.props.user): ', this.props.allNotifications.indexOf(user.peerID));
                    if(this.props.allNotifications.indexOf(user.peerID) != -1){
                        classes += ' notification';
                    }
					listItems.push(<li key={ index } onClick={ () => this.changeConnectedUser(user.peerID) } className={ classes }>{ user.peerID }</li>);
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
		if(typeof this.props.messages != 'undefined'){
			this.props.messages.data.forEach((messageData, index) => {
                if(messageData.isSelfMessage){
                    messages.push(<li key={ index } className="self-message"><span className="user-name">you: </span>{ messageData.msg }</li>)
                } else {
                    messages.push(<li key={ index }><span className="user-name">{ this.props.connectedUserName }: </span>{ messageData.msg }</li>)
                }
			});
		}

        if(this.props.connectedUserName == ''){
            return <h4>Choose someone to talk</h4>
        } else {
            return (
                <div>
                    <h4>@{ this.props.connectedUserName }</h4>
                    <ul>
                        { messages }
                    </ul>
                </div>
            )
        }

	}
}

ReactDOM.render(
	<ChatApp />,
	document.getElementById('chatApp')
);