import React from "react";
import uuidv4 from "uuid/v4";
import firebase from '../../firebase';
import { Segment, Button, Input } from 'semantic-ui-react';
import { Picker, emojiIndex } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

import FileModal from './FileModal';
import ProgressBar from "./ProgressBar";

class MessageForm extends React.Component {
  state = {
    //with storageRef we reach out to firebase in order to store image
    storageRef: firebase.storage().ref(),
    typingRef: firebase.database().ref("typing"),
    uploadTask: null,
    uploadState: "",
    percentUploaded: 0,
    message: '',
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    loading: false,
    errors: [],
    modal: false,
    emojiPicker: false
  };

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleKeyDown = event => {
    if(event.keyCode === 13) {
      this.sendMessage();
    }

    const { message, typingRef, channel, user } = this.state;

    if (message) {
      typingRef
        .child(channel.id)
        .child(user.uid)
        .set(user.displayName);
    } else {
      typingRef
        .child(channel.id)
        .child(user.uid)
        .remove();
    }
  };

  handleTogglePicker = () => {
    this.setState({ emojiPicker: !this.state.emojiPicker });
  };

  handleAddEmoji = emoji => {
    const oldMessage = this.state.message;
    const newMessage = this.colonToUnicode(` ${oldMessage} ${emoji.colons} `);
    this.setState({ message: newMessage, emojiPicker: false });
    setTimeout(() => this.messageInputRef.focus(), 0);
  };

  colonToUnicode = message => {
    return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
      x = x.replace(/:/g, "");
      let emoji = emojiIndex.emojis[x];
      if (typeof emoji !== "undefined") {
        let unicode = emoji.native;
        if (typeof unicode !== "undefined") {
          return unicode;
        }
      }
      x = ":" + x + ":";
      return x;
    });
  };

  createMessage = (fileUrl = null) => {
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: this.state.user.uid,
        name: this.state.user.displayName,
        avatar: this.state.user.photoURL
      }
    };
    //we check if its a message with text content or a file content
    if (fileUrl !== null) {
      message["image"] = fileUrl;
    } else {
      message["content"] = this.state.message;
    }
    return message;
  };

  sendMessage = () => {
    const { getMessagesRef } = this.props;
    const { message, channel, user, typingRef } = this.state;

    if (message) {
      this.setState({ loading: true });
      getMessagesRef()
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading: false, message: '', errors: [] });
          typingRef
            .child(channel.id)
            .child(user.uid)
            .remove();
        })
      .catch(err => {
        console.error(err);
        this.setState({
          loading: false,
          errors: this.state.errors.concat(err)
        });
      });
    } else {
      this.setState({
        errors: this.state.errors.concat({ message: 'Add a message' })
      });
    }
  };

// function witch check witch path to use private or public
  getPath = () => {
    if (this.props.isPrivateChannel) {
      return `chat/private-${this.state.channel.id}`;
    } else {
      return "chat/public";
    }
  };

  //to upload an image and post it as a message
  uploadFile = (file, metadata) => {
    const pathToUpload = this.state.channel.id;
    //we get our messages ref from props
    const ref = this.props.getMessagesRef();
    //we user uuidv4 function to create a random string
    const filePath = `${this.getPath()}/${uuidv4()}.jpg`;

    this.setState(
      {
        uploadState: "uploading",
        //reference to our storageRef and put a child on it, witch is a file path
        uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
      },
      //a callback funcion:
      () => {
        //we listen for state changes
        this.state.uploadTask.on(
          "state_changed",
          snap => {
            const percentUploaded = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            this.setState({ percentUploaded });
          },
          //error callback catching any errors
          err => {
            console.error(err);
            this.setState({
              //if any errors - upload state with error and task to null
              errors: this.state.errors.concat(err),
              uploadState: "error",
              uploadTask: null
            });
          },
          //another callback witch reference a snapshot property on a uploadTask..
          () => {
            this.state.uploadTask.snapshot.ref
              .getDownloadURL()
              //a promise allowing us to get the url of the file that has been uploaded..
              .then(downloadUrl => {
                this.sendFileMessage(downloadUrl, ref, pathToUpload);
              })
              //since its a promise we are catching for any errors
              .catch(err => {
                console.error(err);
                this.setState({
                  errors: this.state.errors.concat(err),
                  uploadState: "error",
                  uploadTask: null
                });
              });
          }
        );
      }
    );
  };

  sendFileMessage = (fileUrl, ref, pathToUpload) => {
    ref
      .child(pathToUpload)
      .push()
      .set(this.createMessage(fileUrl))
      .then(() => {
        //after sending message we update state to done
        this.setState({ uploadState: "done" });
      })
      .catch(err => {
        console.error(err);
        this.setState({
          errors: this.state.errors.concat(err)
        });
      });
  };

  render() {
    // prettier-ignore
    const { errors, message, loading, modal, uploadState, percentUploaded, emojiPicker } = this.state;
    return (
      <Segment className="message__form">
        {emojiPicker && (
            <Picker
              set="apple"
              onSelect={this.handleAddEmoji}
              className="emojipicker"
              title="Pick your emoji"
              emoji="point_up"
            />
          )}
        <Input
          fluid
          name="message"
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          value={message}
          ref={node => (this.messageInputRef = node)}
          style={{ marginBottom: '0.7em' }}
          label={
            <Button
              icon={emojiPicker ? "close" : "add"}
              content={emojiPicker ? "Close" : null}
              onClick={this.handleTogglePicker}
            />
          }
          labelPosition="left"
          className={
            errors.some(error => error.message.includes('message')) ? 'error' : ''
          }
          placeholder="Write your message"
        />
        <Button.Group icon widths="2">
          <Button
          onClick={this.sendMessage}
          disabled={loading}
          color="orange"
          content="Add Reply"
          labelPosition="left"
          icon="edit"
          />
          <Button
            color="teal"
            disabled={uploadState === 'uploading'}
            onClick={this.openModal}
            content="Upload Media"
            labelPosition="right"
            icon="cloud upload"
          />
          </Button.Group>
          <FileModal
            modal={modal}
            closeModal={this.closeModal}
            uploadFile={this.uploadFile}
          />
          <ProgressBar
            uploadState={uploadState}
            percentUploaded={percentUploaded}
          />
      </Segment>
    );
  }
};

export default MessageForm;
