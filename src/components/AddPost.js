import React, { Component } from "react";
import { API, Auth, graphqlOperation } from "aws-amplify";
import { createPost } from "../graphql/mutations";

class AddPost extends Component {
  state = {
    postOwnerId: "",
    postOwnerUsername: "",
    postTitle: "",
    postBody: "",
  };

  componentDidMount = async () => {
      await Auth.currentUserInfo()
        .then(user =>{
            //console.log(user);
            //console.log(JSON.stringify(user));
            this.setState({
                postOwnerId: user.attributes.sub,
                postOwnerUsername:user.attributes.email
            });
        });
  };

  handleChangeEvent = event=>{
    this.setState({
        [event.target.name] : event.target.value
    });
  };

  handleAddPost = async (event) => {
    event.preventDefault();
    const input = {
      postOwnerId: this.state.postOwnerId,
      postOwnerUsername: this.state.postOwnerUsername,
      postTitle: this.state.postTitle,
      postBody: this.state.postBody,
      createdAt: new Date().toISOString(),
    };

    await API.graphql(graphqlOperation(createPost, { input }));
    this.setState({
      postTitle: "",
      postBody: "",
    });
  };

  render() {
    return (
      <form className="add-post" onSubmit={this.handleAddPost}>
        <input
          style={{ font: "19px" }}
          type="text"
          placeholder="Title"
          name="postTitle"
          required
          value={this.state.postTitle}
          onChange={this.handleChangeEvent}
        />
        <textarea
          type="text"
          name="postBody"
          rows="3"
          cols="40"
          required
          placeholder="Post body"
          value={this.state.postBody}
          onChange={this.handleChangeEvent}
        />
        <input type="submit" className="btn" style={{ fontSize: "19px" }} />
      </form>
    );
  }
}

export default AddPost;
