import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import Login from './components/Auth/Login.jsx';
import Register from './components/Auth/Register.jsx';
import Spinner from './Spinner';
import * as serviceWorker from './serviceWorker';
import firebase from './firebase';

import 'semantic-ui-css/semantic.min.css';

import { BrowserRouter as Router, Switch, Route, withRouter } from 'react-router-dom';

//we will be creating a lot of components, many of which are going to need to access data
//from user object we should be able to execute the function 'setUser', we pass user data
//and put all of that data on global state that all our app components could use it.
//to do this - we set STATE MANAGEMENT SYSTEM - REDUX

import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from "./reducers";
import { setUser } from './actions';

//to create our global state we create a store variable and this will store the return value
//from executing the createStore function and for that we need to pass an empty function for now

const store = createStore(rootReducer, composeWithDevTools());

class Root extends React.Component {
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.props.setUser(user);
        this.props.history.push('/');
      }
    })

  }

  render() {
    return this.props.isLoading ? <Spinner /> : (
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
      </Switch>
    );
  }
}

const mapStateFromProps = state => ({
  isLoading: state.user.isLoading
});

const RootWithAuth = withRouter(
  connect(
    mapStateFromProps,
    { setUser }
  )(Root)
);

ReactDOM.render(
//to provide that GLOBAL STATE to all of our components:
  <Provider store={store}>
    <Router>
      <RootWithAuth />
    </Router>
  </Provider> , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
