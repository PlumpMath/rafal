import React from 'react';
import EventsType from './EventsType';
var io = require('socket.io-client')();

export default class Manager extends React.Component{
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

    promptForNickName(){
        this.userName = prompt('your name: ');
        if(!this.userName.length){
            this.promptForNickName();
        } else {
            this.initChat();
        }
    }

    initChat(){
        this.setState({
            initChat: true
        });

        this.connectToServer();
    }

    connectToServer(){
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