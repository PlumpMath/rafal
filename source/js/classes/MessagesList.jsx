import React from 'react';

export default class MessagesList extends React.Component{

    textFormatFilter(text){
        var formattedText = text;
        if(formattedText.indexOf('*') !== -1){
            var textArray = formattedText.split('*');
            textArray.forEach((string, index) => {
                if( index % 2 && string.length ){
                    textArray[index] = '<strong>' + string + '</strong>';
                }
            });
            formattedText = textArray.join('');
        }

        if(formattedText.indexOf('_') !== -1){
            var textArray = formattedText.split('_');
            textArray.forEach((string, index) => {
                if( index % 2 && string.length ){
                    textArray[index] = '<cite>' + string + '</cite>';
                }
            });
            formattedText = textArray.join('');
        }

        if(formattedText.indexOf('@') !== -1){
            var notifyUsers = formattedText.match(/@\w*/g);
            console.log('notifyUsers: ', notifyUsers);
        }

        return formattedText;
    }

    render(){
        var messages = [];
        if(typeof this.props.messages != 'undefined'){
            this.props.messages.data.forEach((messageData, index) => {

                var message = this.textFormatFilter(messageData.msg);

                if(messageData.isSelfMessage){
                    messages.push(
                        <li key={ index } className="self-message">
                            <span className="user-name">> </span>
                            <span dangerouslySetInnerHTML={{__html: message}} />
                        </li>
                    );
                } else {
                    messages.push(
                        <li key={ index }>
                            <span className="user-name">> </span>
                            <span dangerouslySetInnerHTML={{__html: message}} />
                        </li>
                    );
                }
            });
        }
        
        return (
            <ul className="messages">
                { messages }
            </ul>
        )
        

    }
}