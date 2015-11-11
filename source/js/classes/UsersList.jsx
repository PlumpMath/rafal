import React from 'react';

export default class UsersList extends React.Component{
    changeConnectedUser(peerID){
        this.props.changeConnectedUser(peerID);
    }

    render(){
        var listItems = [];
        var infoClasses = this.props.connectedUserName? 'info' : 'connected-user';
        listItems.push(<li key="-1" onClick={ () => this.changeConnectedUser('#info') } className={ infoClasses }>#info</li>);
        if(typeof this.props.users != 'undefined'){
            this.props.users.forEach((user, index) => {
                if(user.peerID != this.props.user){
                    let classes = this.props.connectedUserName == user.peerID? 'connected-user': '';
                    if(this.props.allNotifications.indexOf(user.peerID) != -1){
                        classes += ' notification';
                    }
                    listItems.push(<li key={ index } onClick={ () => this.changeConnectedUser(user.peerID) } className={ classes }>@{ user.peerID }</li>);
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