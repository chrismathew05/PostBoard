//Core React+Meteor imports
import React, {Component} from 'react';
import {withTracker} from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

//Custom Component Imports
import Post from "./Post.jsx";
import {Posts} from '../../../api/Posts.js';

//Semantic UI Imports

//Other

class PostsList extends Component {
    render() {
        return (
            <div>
                {/*loop through posts and pass each one's data to the Post component*/}
                {this.props.posts.map((post) => (
                    <Post key={post._id} postId={post._id} important={post.important} content={post.content} timestamp={post.timestamp} />
                ))}
            </div>
        );
    }
}

PostsList.propTypes = {
    activeBoardId: PropTypes.string,
    posts: PropTypes.array,
    ready: PropTypes.bool
};

// note data being passed from parent component (MessageBoard.jsx) via props to withTracker
export default withTracker((props) => {
    let activeBoardId = props.activeBoardId;

    // activeBoardId was req'd to subscribe only to posts that correspond to the active board (see Post.js for publication)
    // helps cut down download time when number of posts is really big (which probably won't be the case for us but oh well)
    Meteor.subscribe('boardPosts', activeBoardId);

    let posts = Posts.find({}, { sort: { important: -1 } }).fetch();

    return {
        posts,
    };
})(PostsList);