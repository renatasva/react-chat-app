import React from "react";
import { Segment, Button, Input } from 'semantic-ui-react';


class MessageForm extends React.Component {
  state = {
    message: '',
    channel: this.props.currentChannel,
    loading: false
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  sendMessage = () => {
    const { messagesRef } = this.props;
    const { message, channel } = this.state;

    if (message) {
      this.setState({ loading: true });
      messagesRef
        .child(channel.id)
        .push()


    }
  }

  render() {
    return (
      <Segment className="message__form">
        <Input
          fluid
          name="message"
          onChange={this.handleChange}
          style={{ marginBottom: '0.7em' }}
          label={<Button icon={'add'} />}
          labelPosition="left"
          placeholder="Write your message"
        />
        <Button.Group icon widths="2">
          <Button
          onClick={this.sendMessage}
          color="orange"
          content="Add Reply"
          labelPosition="left"
          icon="edit"
          />
          <Button
            color="teal"
            content="Upload Media"
            labelPosition="right"
            icon="cloud upload"
          />
        </Button.Group>
      </Segment>
    );
  }
}

export default MessageForm;
