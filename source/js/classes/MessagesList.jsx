import React from 'react';

export default class MessagesList extends React.Component{

    boldFilter(text){
        if(text.indexOf('*') !== -1){
            var textArray = text.split('*');
            textArray.forEach((string, index) => {
                if( index % 2 && string.length ){
                    textArray[index] = '<strong>' + string + '</strong>';
                }
            });
            var formattedText = textArray.join('');
            return formattedText;
        }

        return text;
    }

    render(){
        var messages = [];
        if(typeof this.props.messages != 'undefined'){
            this.props.messages.data.forEach((messageData, index) => {

                var message = this.boldFilter(messageData.msg);

                if(messageData.isSelfMessage){
                    messages.push(
                        <li key={ index } className="self-message">
                            <span className="user-name">you: </span>
                            <span dangerouslySetInnerHTML={{__html: message}} />
                        </li>
                    );
                } else {
                    messages.push(
                        <li key={ index }>
                            <span className="user-name">{ this.props.connectedUserName }: </span>
                            <span dangerouslySetInnerHTML={{__html: message}} />
                        </li>
                    );
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