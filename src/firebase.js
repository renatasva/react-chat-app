import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';


// Initialize Firebase
var config = {
  apiKey: "AIzaSyCh3eCfgX2Oo9jDwE6l3HuUiqaXOH1724o",
  authDomain: "react-chat-app-9a594.firebaseapp.com",
  databaseURL: "https://react-chat-app-9a594.firebaseio.com",
  projectId: "react-chat-app-9a594",
  storageBucket: "react-chat-app-9a594.appspot.com",
  messagingSenderId: "34871076790"
};
firebase.initializeApp(config);

export default firebase;