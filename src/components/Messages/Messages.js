import React from "react";
import { Segment, Comment } from 'semantic-ui-react';
import firebase from '../../firebase';

import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';

class Messages extends React.Component {
  state = {
    privateChannel: this.props.isPrivateChannel,
    //references a new collection within our database called privateMessages
    privateMessagesRef: firebase.database().ref("privateMessages"),
    messagesRef: firebase.database().ref('messages'),
    messages: [],
    messagesLoading: true,
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    numUniqueUsers: "",
    searchTerm: "",
    searchLoading: false,
    searchResults: []
  }

  componentDidMount() {
    const { channel, user } = this.state;

    if (channel && user ) {
      this.addListeners(channel.id);
    }
  }

  addListeners = channelId => {
    this.addMessageListener(channelId);
  }

  addMessageListener = channelId => {
    let loadedMessages = [];
    const ref = this.getMessagesRef();
    ref.child(channelId).on('child_added', snap => {
      loadedMessages.push(snap.val());
      this.setState({
        messages: loadedMessages,
        messagesLoading: false
      });
      this.countUniqueUsers(loadedMessages);
    });
  };

  //witch ref we should use when sending a message
  getMessagesRef = () => {
    const { messagesRef, privateMessagesRef, privateChannel } = this.state;
    return privateChannel ? privateMessagesRef : messagesRef;
  };

  handleSearchChange = event => {
    this.setState(
      {
        searchTerm: event.target.value,
        searchLoading: true
      },
      () => this.handleSearchMessages()
    );
  };

  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages];
    //gi means that we want out regexp to be applied both globaly and case insensitively
    const regex = new RegExp(this.state.searchTerm, "gi");
    const searchResults = channelMessages.reduce((acc, message) => {
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        acc.push(message);
      }
      return acc;
    }, []);
    this.setState({ searchResults });
    setTimeout(() => this.setState({ searchLoading: false }), 1000);
  };

  //takes a messages array
  countUniqueUsers = messages => {
    //on this messages array we use deruce method, that allows us to get accumulated value for certain type of operation.
    const uniqueUsers = messages.reduce((acc, message) => {
      //we check if accumulator array includes the value of message.user.name
      if (!acc.includes(message.user.name)) {
        //if it doesn't include, we add it to out accumulator with push method
        acc.push(message.user.name);
      }
      //we return the array off accumulated names
      return acc;
    }, []);
    //we check if there is one or more users
    const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
    //and depending of if it's plural or not we can display user or users
    const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : "" }`;
    this.setState({ numUniqueUsers });
  };

  displayMessages = messages =>
    messages.length > 0 &&
    messages.map(message => (
      <Message
        key={message.timestamp}
        message={message}
        user={this.state.user}
      />
    ));

  displayChannelName = channel => {
    return channel
      ? `${this.state.privateChannel ? "@" : "#"}${channel.name}`
      : "";
  };

  render() {
    const { messagesRef, messages, channel, user, numUniqueUsers, searchTerm, searchResults, searchLoading, isPrivateChannel } = this.state;
    return (
      <React.Fragment>
        <MessagesHeader
        //we pass down the channel name property to messages header, by passing the channel that we have within our messages state
          channelName={this.displayChannelName(channel)}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          isPrivateChannel={isPrivateChannel}
        />

        <Segment>
          <Comment.Group className="messages">
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isPrivateChannel={isPrivateChannel}
          getMessagesRef={this.getMessagesRef}
        />
      </React.Fragment>
    );
  }
}

export default Messages;
