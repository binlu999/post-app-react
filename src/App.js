import './App.css';
import React from 'react';
import DisplayPosts from './components/displayPosts';
import AddPost from './components/AddPost';
import {withAuthenticator} from 'aws-amplify-react'

function App() {
  return (
    <div className="App">
      <AddPost/>
      <DisplayPosts/>
    </div>
  );
}

export default withAuthenticator(App,{
includeGreetings:true,
});
