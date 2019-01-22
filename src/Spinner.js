import React from 'react';
import { Loader, Dimmer } from 'semantic-ui-css';

const Spinner = () => (
  <Dimmer active>
    <Loader size="huge" content={"Preparing Chat..."} />
  </Dimmer>
)

export default Spinner;
