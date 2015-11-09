import React from 'react';
import EventsType from './EventsType';
var io = require('socket.io-client')();
var $ = require('jquery');

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
                    this.notify('Hello: ' + this.userName);
                    return;
                }

                this.onNewUserConnected(connectedUserName);
            });

            io.on(EventsType.USER_DISCONNECTED, (disconnectedUserName) => {
                this.onUserDisconnected(disconnectedUserName);
            });
        });
    }

    notify(notificationMessage){
        if (!("Notification" in window)) {
            console.log('Notifications are not supported');
        } else if (Notification.permission === "granted") {
            new Notification(notificationMessage);  
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function (permission) {
                if (permission === "granted") {
                    new Notification(notificationMessage);  
                }
            });
        }   
    }

    onNewUserConnected(userName){
        var allConnectedUsers = this.state.allConnectedUsers;
        allConnectedUsers.push({ peerID: userName });
        this.setState({
            allConnectedUsers: allConnectedUsers
        });
        console.log('onNewUserConnected: ', allConnectedUsers);
        this.notify('New user connected: ' + userName);
    }

    onUserDisconnected(userName){
        var allConnectedUsers = this.state.allConnectedUsers;
        allConnectedUsers.forEach((user, index) => {
            if(userName == user.peerID){
                allConnectedUsers.splice(index, 1);
            }
        });
        
        this.setState({
            allConnectedUsers: allConnectedUsers
        });

        console.log('onUserDisconnected: ', allConnectedUsers);
        this.notify('User disconnected: ' + userName);
    }

    getAllUsersList(){
        console.log('getAllUsersList: ');
        $.ajax({
            url: '/api/allConnectedPeers',
            success: (data) => {
                console.log('success: ', data);
                this.setState({ allConnectedUsers: data });
            }
        });
    }

    promptForNickName(){
        if( localStorage.getItem('userName') ){
            console.log('userName: ', localStorage.getItem('userName'));
            this.userName = localStorage.getItem('userName');
        } else {
            this.userName = prompt('your name: ');
        }

        if( !this.userName.length ){
            this.promptForNickName();
        } else {
            this.initChat();
        }
    }

    initChat(){
        this.setState({
            initChat: true
        });

        // localStorage.setItem('userName', this.userName);

        this.connectToServer();
        this.getAllUsersList();
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
                this.notify('New message from: ' + notification);
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