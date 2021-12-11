import React, { Component } from "react";
import { listPosts } from "../graphql/queries";
import { API, graphqlOperation } from 'aws-amplify';
import DeletePost from "./deletePost";
import EditPost from "./editPost";
import {onCreateComment, onCreatePost, onDeletePost, onUpdatePost} from '../graphql/subscriptions'
import CreateComponentPost from "./createCommentPost";
import CommentPost from "./commentPost";

class DisplayPosts extends Component{
    state={
        posts:[]
    };

    componentDidMount = async()=>{
        this.getPosts();
        this.createPostListener=API.graphql(graphqlOperation(onCreatePost))
        .subscribe({
            next: postData=>{
                const newPost=postData.value.data.onCreatePost;
                const prevPosts=this.state.posts.filter(post=> post.id !== newPost.id);
                const updatedPosts = [newPost, ...prevPosts];
                this.setState({posts:updatedPosts});
            }
        });
        this.deletePostListener=API.graphql(graphqlOperation(onDeletePost))
        .subscribe({
            next:postData=>{
                const deletedPost=postData.value.data.onDeletePost;
                const updatePosts=this.state.posts.filter(post=>post.id!==deletedPost.id);
                this.setState({posts:updatePosts});
            }
        });
        this.updatePostListener=API.graphql(graphqlOperation(onUpdatePost))
        .subscribe({
            next: postData => {
                const updated = postData.value.data.onUpdatePost;
                const {posts}=this.state;
                const index=posts.findIndex(post => post.id === updated.id);
                const updatedPosts=[
                    ...posts.slice(0,index),
                    updated,
                    ...posts.slice(index+1)
                ]
                this.setState({posts:updatedPosts});

            }

        });

        this.commentPostCreateListener = API.graphql(graphqlOperation(onCreateComment))
        .subscribe({
            next: commentData => {
                const createdComment=commentData.value.data.onCreateComment;
                let posts=[...this.state.posts];
                for(let post of posts){
                    if(createdComment.post.id === post.id){
                        post.comments.items.push(createdComment);
                    }
                }
                this.setState({posts});

            }
        });
    }

    componentWillUnmount = async ()=>{
        this.createPostListener.unsubscribe();
        this.deletePostListener.unsubscribe();
        this.updatePostListener.unsubscribe();

        this.commentPostCreateListener.unsubscribe();

    }

    getPosts = async ()=>{
        const result = await API.graphql(graphqlOperation(listPosts));
        //console.log("All results:"+JSON.stringify( result.data.listPosts ));
        //console.log("All results items:"+JSON.stringify( result.data.listPosts.items ));
        this.setState({posts:result.data.listPosts.items});
    };

    render() {
        const {posts}=this.state;
        //console.log("State items:"+posts);
        return posts.map((post)=>{
            return (
                <div className="posts" style={rowstyle} key={post.id}>
                <h1>{post.postTitle}</h1>
                <span style={{fontStyle:"italic",color:"#0ca597"}}>Wrote by {post.postOwnerUsername}
                {' on '}
                <time style={{fontStyle:"italic"}}>
                    {new Date(post.createdAt).toDateString()}
                </time>
                </span>
                <p>{post.postBody}</p>
                <span style={{display:"inline"}}>
                    <DeletePost data={post} /><EditPost {...post} />
                </span>
                <span>
                    <CreateComponentPost postId={post.id} />
                    {post.comments.items.length > 0 && 
                    <span style={{fontSize:"19px",color:"gray"}}>
                        Comments:
                    </span>
                    }
                    {
                        post.comments.items.map((comment,index) => 
                            <CommentPost key={index} commentData={comment}/>
                        )
                    }
                </span>
                </div>
                
            );
        });
    }
}

const rowstyle = {
    background:'#f4f4f4',
    padding:'10px',
    border:'1px #ccc dotted',
    margin:'14px',

}
export default DisplayPosts;