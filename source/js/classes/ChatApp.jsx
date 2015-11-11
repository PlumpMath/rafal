import React from 'react';
import Manager from './Manager.jsx';
import UsersList from './UsersList.jsx';
import MessagesList from './MessagesList.jsx';

export default class ChatApp extends Manager{
    login(){
        var userName = this.refs.loginInput.value;
        if( userName.length ){
            this.initChat(userName);
        }
    }

    initChat(user){
        this.setState({
            loggedIn: true,
            userName: user
        }, () => {
            this.connectToServer();
            this.getAllUsersList();
        });
    }

    sendMessageHandle(){
        this.sendMessage(this.refs.messageInput.value);
        this.refs.messageInput.value = '';
    }

    logout(){
        location.reload();
    }

    render(){
        if(this.state.loggedIn){
            var userInputClasses = 'user-input';
            if( !this.state.connectedUserName ) userInputClasses += ' hide';

            var currentConnectedUserName = this.state.connectedUserName? '@' + this.state.connectedUserName : '#info';

            return (
                <div className="row">
                    <div className="users-column">
                        <h2 onClick={ this.logout }>Logged as {this.state.userName }</h2>
                        <h4>Connected users</h4>
                        <UsersList user={ this.state.userName } users={ this.state.allConnectedUsers } allNotifications={ this.state.allNotifications } connectedUserName={ this.state.connectedUserName } changeConnectedUser={ (peerID) => this.changeConnectedUser(peerID) } />
                    </div>
                    <div className="messages-column">
                        <h2 className="connected-user">{ currentConnectedUserName }</h2>
                        <MessagesList connectedUserName={ this.state.connectedUserName } messages={ this.state.currentMessages[this.state.connectedUserName] } />
                        <div className={ userInputClasses }>
                            <input ref="messageInput" type="text" onKeyDown={ (evt) => { if(evt.keyCode == 13) this.sendMessageHandle() } } />
                            <button className="button" onClick={ () => this.sendMessageHandle() }>Send message</button>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className='login-wrap'>
                    <input placeholder="Your name" ref="loginInput" type="text" onKeyDown={ (evt) => { if(evt.keyCode == 13) this.login() } } />
                    <button className="button" onClick={ () => this.login() }>
                        Login
                    </button>
                </div>
            )
        }
    }
}