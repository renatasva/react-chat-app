import React from "react";
import { Header, Segment, Input, Icon } from 'semantic-ui-react';

class MessagesHeader extends React.Component {
  render() {
    const { channelName, numUniqueUsers } = this.props;

    return (
      <Segment clearing>
        {/* Channel title */}
        <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
          <span>
          {channelName}<span> </span>
          <Icon name={"star outline"} color="black" />
          </span>
          <Header.Subheader>{numUniqueUsers}</Header.Subheader>
        </Header>
        {/* Search input */}
        <Header floated="right">
          <Input
            size="mini"
            icon="search"
            name="searchTerm"
            placeholder="Search Messages"
          />
        </Header>
      </Segment>
    );
  }
}

export default MessagesHeader;
