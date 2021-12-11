import { input } from '@aws-amplify/ui';
import { API, Auth, graphqlOperation } from 'aws-amplify'
import React,{Component} from 'react'
import { updatePost } from '../graphql/mutations';

class EditPost extends Component{

    state={
        show:false,
        id:"",
        postOwnerId: "",
        postOwnerUsername: "",
        postData:{
            postTitle: this.props.postTitle,
            postBody: this.props.postBody
        }
        
    }

    componentWillUnmount = async ()=>{
        await Auth.currentUserInfo()
        .then(user=>{
            this.setState({
                postOwnerId:user.attributes.sub,
                postOwnerUsername:user.attributes.email
            })
        });
    }
    
    handleModule =()=>{
        this.setState({
            show: !this.state.show
        })
        document.body.scrollTop=0;
        document.documentElement.scrollTop=0;
    }

    handleTitle = event =>{
        
        this.setState({
            postData: {...this.state.postData, postTitle: event.target.value}
        });
    };
    handlePostBody = event =>{
        this.setState({
            postData:{...this.state.postData,postBody:event.target.value}
        });

    };

    handleUpdatePost = async event => {
        event.preventDefault();
        const input={
            id:this.props.id,
            postOwnerId : this.state.postOwnerId,
            postOwnerUsername : this.postOwnerUsername,
            postTitle : this.state.postData.postTitle,
            postBody: this.state.postData.postBody
        };

        await API.graphql(graphqlOperation(updatePost,{input}));

        this.setState({show:!this.state.show});

    };

    render (){
        return(
            <>
                {this.state.show && (
                    <div className="modal">
                        <button className="close"
                        onClick={this.handleModule} >
                            X
                        </button>
                    <form className="add-post" onSubmit={(event)=>this.handleUpdatePost(event)}>
                    <input style={{fontSize:"19px"}}
                        type="text" placeholder="title"
                        name="postTitle"
                        value={this.state.postData.postTitle}
                        onChange={this.handleTitle} />
                    <input style={{height:"150",fontSize:"19px"}}
                    type="text"
                    name="postBody"
                    value={this.state.postData.postBody}
                    onChange={this.handlePostBody}
                    />
                    <button>Update Post</button>
                    </form>
                    </div>
                )

                }
            <button onClick={this.handleModule}>Edit</button>
            </>
        );
    }
}

export default EditPost;