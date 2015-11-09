import React from 'react';
import Manager from './Manager.jsx';
import UsersList from './UsersList.jsx';
import MessagesList from './MessagesList.jsx';

export default class ChatApp extends Manager{
    sendMessageHandle(){
        this.sendMessage(this.refs.messageInput.value);
        this.refs.messageInput.value = '';
    }

    render(){
        if(this.state.initChat){
            return (
                <div className="row">
                    <div className="users-column">
                        <h2>Logged as {this.userName }</h2>
                        <h4>Connected users</h4>
                        <UsersList user={ this.userName } users={ this.state.allConnectedUsers } allNotifications={ this.state.allNotifications } connectedUserName={ this.state.connectedUserName } changeConnectedUser={ (peerID) => this.changeConnectedUser(peerID) } />
                    </div>
                    <div className="messages-column">
                        <h2 className="connected-user">@{ this.state.connectedUserName }</h2>
                        <MessagesList connectedUserName={ this.state.connectedUserName } messages={ this.state.currentMessages[this.state.connectedUserName] } />
                        <div className="user-input">
                            <input ref="messageInput" type="text" onKeyDown={ (evt) => { if(evt.keyCode == 13) this.sendMessageHandle() } } />
                            <button className="button" onClick={ () => this.sendMessageHandle() }>Send message</button>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <button className="button" onClick={ () => this.promptForNickName() }>
                    Open chat
                </button>
            )
        }
    }
}