import React from 'react';

export default class MessagesList extends React.Component{
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