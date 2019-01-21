import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import Login from './components/Auth/Login.jsx';
import Register from './components/Auth/Register.jsx';
import * as serviceWorker from './serviceWorker';
import firebase from './firebase';

import 'semantic-ui-css/semantic.min.css';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

class Root extends React.Component { 
  render() {
    return (
    <Router>
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
      </Switch>
    </Router>
   );
  }
}
ReactDOM.render(<Root />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
