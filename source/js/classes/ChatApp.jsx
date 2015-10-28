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
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-sm-4 users-list">
                            <h6>Logged as {this.userName }</h6>
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
                <button className="btn btn-primary" onClick={ () => this.promptForNickName() }>
                    Open chat
                </button>
            )
        }
    }
}