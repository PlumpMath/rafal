import React from 'react';

export default class UsersList extends React.Component{
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