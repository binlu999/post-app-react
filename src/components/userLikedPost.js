import React,{Component} from "react";


class UserLikedPost extends Component{

    render(){
        const users=this.props.data;
        return users.map(user=>{
            return (
                <>
                <div key={user}>
                    <span style={{fontStyle:"bold",color:"#ged"}}>
                        {user}
                    </span>

                </div>
                </>
            )
        });
    }
}

export default UserLikedPost;