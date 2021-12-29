import React, { Component } from "react";
import { listPosts } from "../graphql/queries";
import { API, Auth, graphqlOperation } from "aws-amplify";
import DeletePost from "./deletePost";
import EditPost from "./editPost";
import {
  onCreateComment,
  onCreateLike,
  onCreatePost,
  onDeletePost,
  onUpdatePost,
} from "../graphql/subscriptions";
import CreateComponentPost from "./createCommentPost";
import CommentPost from "./commentPost";
import { FaThumbsUp,FaSadTear } from "react-icons/fa";
import { createLike } from "../graphql/mutations";
import UserLikedPost from './userLikedPost'

class DisplayPosts extends Component {
  state = {
    ownerId: "",
    ownerUsername: "",
    isHovering: false,
    errorMessage: "",
    likedBy: [],
    posts: [],
  };

  componentDidMount = async () => {
    this.getPosts();
    await Auth.currentUserInfo().then((user) => {
      console.log(JSON.stringify(user));
      this.setState({
        ownerId: user.attributes.sub,
        ownerUsername: user.attributes.email,
      });
    });
    console.log(this.state);
    this.createPostListener = API.graphql(
      graphqlOperation(onCreatePost)
    ).subscribe({
      next: (postData) => {
        const newPost = postData.value.data.onCreatePost;
        const prevPosts = this.state.posts.filter(
          (post) => post.id !== newPost.id
        );
        const updatedPosts = [newPost, ...prevPosts];
        this.setState({ posts: updatedPosts });
      },
    });
    this.deletePostListener = API.graphql(
      graphqlOperation(onDeletePost)
    ).subscribe({
      next: (postData) => {
        const deletedPost = postData.value.data.onDeletePost;
        const updatePosts = this.state.posts.filter(
          (post) => post.id !== deletedPost.id
        );
        this.setState({ posts: updatePosts });
      },
    });
    this.updatePostListener = API.graphql(
      graphqlOperation(onUpdatePost)
    ).subscribe({
      next: (postData) => {
        const updated = postData.value.data.onUpdatePost;
        const { posts } = this.state;
        const index = posts.findIndex((post) => post.id === updated.id);
        const updatedPosts = [
          ...posts.slice(0, index),
          updated,
          ...posts.slice(index + 1),
        ];
        this.setState({ posts: updatedPosts });
      },
    });

    this.commentPostCreateListener = API.graphql(
      graphqlOperation(onCreateComment)
    ).subscribe({
      next: (commentData) => {
        const createdComment = commentData.value.data.onCreateComment;
        let posts = [...this.state.posts];
        for (let post of posts) {
          if (createdComment.post.id === post.id) {
            post.comments.items.push(createdComment);
          }
        }
        this.setState({ posts });
      },
    });
    this.likePostCreateListener = API.graphql(
      graphqlOperation(onCreateLike)
    ).subscribe({
      next: (postData) => {
        const createdLike = postData.value.data.onCreateLike;
        let posts = [...this.state.posts];
        for (let post of posts) {
          if (createdLike.post.id === post.id) {
            post.likes.items.push(createdLike);
          }
        }
        this.setState({ posts: posts });
      },
    });
  };

  componentWillUnmount = async () => {
    this.createPostListener.unsubscribe();
    this.deletePostListener.unsubscribe();
    this.updatePostListener.unsubscribe();

    this.commentPostCreateListener.unsubscribe();
    this.likePostCreateListener.unsubscribe();
  };

  getPosts = async () => {
    const result = await API.graphql(graphqlOperation(listPosts));
    //console.log("All results:"+JSON.stringify( result.data.listPosts ));
    //console.log("All results items:"+JSON.stringify( result.data.listPosts.items ));
    this.setState({ posts: result.data.listPosts.items });
  };

  likedPost = (postId) => {
    const { posts } = this.state;
    const post = posts.find((post) => post.id === postId);
    if(post){
      if (post.id === postId)
        if (post.postOwnerId === this.state.ownerId) return true;
      for (let like of post.likes.items) {
        if (like.likeOwnerId === this.state.ownerId) {
          return true;
        }
      }
    }
    return false;
  };

  handleLike = async (postId) => {
    console.log("To create like post");
    if (this.likedPost(postId)) {
        console.log("Liked");
      return this.setState({ errorMessage: "Can't like your own post" });
    } else {
        console.log("To create like");
      const input = {
        numberLikes: 1,
        likeOwnerId: this.state.ownerId,
        likeOwnerUsername: this.state.ownerUsername,
        likePostId: postId,
      };

      try {
        const result = await API.graphql(
          graphqlOperation(createLike, { input })
        );
        console.log("Liked:", result.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  handleOnMouseEnter = async postId =>{
    const { posts } = this.state;
    const post = posts.find((post) => post.id === postId);
    let innerLikes=[];
    if(post){
      if (post.id === postId)
      for (let like of post.likes.items) {
          console.log(like);
        innerLikes.push(like.likeOwnerUsername)
      }
    }
    console.log(innerLikes);
    this.setState({
        isHovering:true,
        likedBy:innerLikes});
    
  }

  handleOnMouseLeave = async ()=>{
      this.setState(
          {
              isHovering:!this.state.isHovering,
              likedBy:[]
          }
      );
  }
  render() {
    const { posts } = this.state;
    const logedInUser = this.state.ownerId;

    //console.log("State items:"+posts);
    return posts.map((post) => {
      return (
        <div className="posts" style={rowstyle} key={post.id}>
          <h1>{post.postTitle}</h1>
          <span style={{ fontStyle: "italic", color: "#0ca597" }}>
            Wrote by {post.postOwnerUsername}
            {" on "}
            <time style={{ fontStyle: "italic" }}>
              {new Date(post.createdAt).toDateString()}
            </time>
          </span>
          <p>{post.postBody}</p>
          <span style={{ display: "inline" }}>
            {post.postOwnerId === logedInUser && <DeletePost data={post} />}
            {post.postOwnerId === logedInUser && <EditPost {...post} />}
            <span>
              <p className="alert">
                {post.postOwnerId === logedInUser && this.state.errorMessage}
              </p>
              <p
                onMouseEnter={()=>this.handleOnMouseEnter(post.id)}
                onMouseLeave={()=>this.handleOnMouseLeave(post.id)} 
                onClick={() => this.handleLike(post.id)}
                style={{color : (post.likes.items.length >0 ?"blue":"gray")}}
                className="like-button"
                >
                <FaThumbsUp />
                {post.likes.items.length}
              </p>
              {
                  this.state.isHovering &&
                  <div className="user-liked">
                      {
                          this.state.likedBy.length === 0 ? 
                          "Liked by none" :
                          "Liked by: "
                      }
                      {
                          this.state.likedBy.length===0? 
                          <FaSadTear/>:<UserLikedPost data={this.state.likedBy} />

                      }
                  </div>
              }
            </span>
          </span>
          <span>
            <CreateComponentPost postId={post.id} />
            {post.comments.items.length > 0 && (
              <span style={{ fontSize: "19px", color: "gray" }}>Comments:</span>
            )}
            {post.comments.items.map((comment, index) => (
              <CommentPost key={index} commentData={comment} />
            ))}
          </span>
        </div>
      );
    });
  }
}

const rowstyle = {
  background: "#f4f4f4",
  padding: "10px",
  border: "1px #ccc dotted",
  margin: "14px",
};
export default DisplayPosts;
