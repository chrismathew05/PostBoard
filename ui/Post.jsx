//Core React+Meteor imports
import React, {Component} from 'react';
import PropTypes from 'prop-types';

//Semantic UI Imports
import { Message } from "semantic-ui-react";

export default class Post extends Component {
    deletePost = () => {
        Meteor.call('Posts.remove', this.props.postId);
    };

    render() {
        return <Message onDismiss={this.deletePost} color={this.props.important ? 'red' : 'grey'} header={this.props.timestamp} list={this.props.content.split('\n')}/>;
    }
}

Post.propTypes = {
    index: PropTypes.number,
    postId: PropTypes.string,
    important: PropTypes.bool,
    content: PropTypes.string,
    timestamp: PropTypes.string
};