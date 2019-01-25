import React from "react";
import mime from 'mime-types';
import { Modal, Icon, Button, Input } from 'semantic-ui-react';

class FileModal extends React.Component {
  state = {
    file: null,
    authorized: ['image/jpeg', 'image/png']
  };

  addFile = event => {
    const file = event.target.files[0];
    //check if there is a file
    if (file) {
      this.setState({ file });
    }
  };

  sendFile = () => {
    const { file } = this.state;
    const { uploadFile, closeModal } = this.props;
    //check if the file property and state isn't empty
    if (file !== null) {
    //check if file type is allowed
      if (this.isAuthorized(file.name)) {
        //send file
        const metadata = { contentType: mime.lookup(file.name) }; 
        uploadFile(file, metadata);
        closeModal();
        this.clearFile();
      }
    }
  };

  isAuthorized = filename => this.state.authorized.includes(mime.lookup(filename));

  clearFile = () => this.setState({ file: null });

  render() {
    const { modal, closeModal } = this.props;

    return (
      <Modal basic open={modal} onClose={closeModal}>
        <Modal.Header>Select an Image File</Modal.Header>
        <Modal.Content>
          <Input
            onChange={this.addFile}
            fluidlabel="File types: jpg, png"
            name="file"
            type="file"
          />
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={this.sendFile}
            color="green"
            inverted
          >
          <Icon name="checkmark" /> Send
          </Button>
          <Button
            color="red"
            inverted
            onClick={closeModal}
          >
          <Icon name="remove" /> Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}

export default FileModal;
