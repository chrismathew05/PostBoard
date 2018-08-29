//Core React+Meteor imports
import React, {Component} from 'react';
import {withTracker} from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

//Custom Component Imports
import AddBoardModal from "./AddBoardModal.jsx";
import PostsList from "./PostsList.jsx";
import PostInput from "./PostInput.jsx";

import {PostBoard} from "../../../api/PostBoard.js";

//Semantic UI Imports
import {Button, Label, Grid, Divider, Icon, Popup, Confirm} from 'semantic-ui-react';

//Other
import {toast} from "react-toastify";

class MessageBoard extends Component {
    state = {
        activeBoardIndex: 0,
        open: false
    };

    renderPostsList = () => {
        let activeBoardId = this.props.boards[this.state.activeBoardIndex]._id;
        return <PostsList activeBoardId={activeBoardId} />;
    };

    renderBoardName = () => {
        if(this.props.boards.length > 0) {
            let activeBoardName = this.props.boards[this.state.activeBoardIndex].name;
            return (
                <span>
                   <Icon name='hashtag'/>{activeBoardName}
                </span>
            );
        } else {
            return(<span>No Boards Exist!</span>)
        }
    };

    // Previous Board
    decrementActiveBoardIndex = () => {
        if(this.state.activeBoardIndex === 0) { return; }
        this.setState({activeBoardIndex: this.state.activeBoardIndex - 1});
    };

    // Next Board
    incrementActiveBoardIndex = () => {
        if(this.state.activeBoardIndex === this.props.boards.length - 1) { return; }
        this.setState({activeBoardIndex: this.state.activeBoardIndex + 1});
    };

    // Deletion Confirmation
    open = () => this.setState({ open: true });
    close = () => this.setState({ open: false });
    confirm = () => {
        let activeBoard = this.props.boards[this.state.activeBoardIndex];
        let activeBoardId = activeBoard._id;
        let activeBoardName = activeBoard.name.toLowerCase();

        // ensure board is not General Board
        if(activeBoardName === 'general') {
            toast.error('This is a protected board - cannot delete!');
            return;
        }

        // ensure board is not a User Board
        let userNames = this.props.userNames;
        let userNamesLength = userNames.length;
        for (let i = 0; i < userNamesLength; i++) {
            let userName = userNames[i];
            if(activeBoardName === userName) {
                toast.error('This is a protected board - cannot delete!');
                return;
            }
        }

        Meteor.call('PostBoard.remove', activeBoardId);
        this.setState({ open: false });
        this.decrementActiveBoardIndex();
        toast.success('Board Removed!');
    };

    render() {
        return (
            <span>
                { this.props.ready ?
                    <Grid centered>
                        <Grid.Row>
                            <Grid.Column mobile={16} computer={15}>
                                <PostInput boards={this.props.boards} boardsCopy={this.props.boardsCopy} thisUserBoardId={this.props.thisUserBoardId}/>
                                <Divider/>

                                {/*Post Board controls*/}
                                <Grid.Row>
                                    <Grid.Column>
                                        <Label size='big' color='blue'>
                                            {this.renderBoardName()}
                                        </Label>
                                        <div style={{ float: 'right', height: 0 }}>
                                            <Popup
                                                inverted
                                                trigger={<Button circular icon='trash' color='red' onClick={this.open}/>}
                                                content='Delete Board'
                                                position='bottom center'
                                            /> {/*Delete Board*/}
                                            <AddBoardModal boards={this.props.boards}/> {/*Add Board*/}
                                            <Popup
                                                inverted
                                                trigger={<Button circular icon='arrow left' onClick={this.decrementActiveBoardIndex} />}
                                                content='Previous Board'
                                                position='bottom center'
                                            /> {/*Previous Board*/}
                                            <Popup
                                                inverted
                                                trigger={<Button circular icon='arrow right' onClick={this.incrementActiveBoardIndex}/>}
                                                content='Next Board'
                                                position='bottom center'
                                            /> {/*Next Board*/}

                                            {/*Deletion Confirmation*/}
                                            <Confirm open={this.state.open} onCancel={this.close} onConfirm={this.confirm} size={'mini'} />
                                        </div>

                                    </Grid.Column>
                                </Grid.Row>

                                <br />
                                {/*Posts List*/}
                                <Grid.Row>
                                    <Grid.Column>
                                        { this.props.boards.length > 0 ?
                                            <div>
                                                {this.renderPostsList()}
                                            </div> : <span/>
                                        }
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid> : <span/> //what to display if still loading
                }
            </span>
        );
    }
}

MessageBoard.propTypes = {
    boards: PropTypes.array,
    userNames: PropTypes.array,
    ready: PropTypes.bool,
    thisUserBoardId: PropTypes.string
};

export default withTracker(() => {
    let boardSub = Meteor.subscribe('allBoards');
    let usersSub = Meteor.subscribe('allUsers');

    let ready = boardSub.ready() && usersSub.ready(); // used to check if loading or data ready

    let users = Meteor.users.find().fetch();

    //find the board id that corresponds to current user
    let thisUserBoardName = Meteor.users.find({ _id: Meteor.userId() }).fetch()[0].profile.name.replace(/\s/g,''); //removes ALL spaces to match User Board Name: i.e. ChrisMathew
    let thisUserBoard = PostBoard.find({ name: thisUserBoardName }).fetch()[0]; //find board associated with username
    let thisUserBoardId = thisUserBoard ? thisUserBoard._id : ''; //get id of that board

    //Get list of just user names, with spaces removed entirely and all lower case
    //Used only to check before deletion of board, as these represent 'protected' boards (along with the General board)
    let userNames = [];
    let usersLength = users.length;
    for (let i = 0; i < usersLength; i++) {
        let userName = users[i].profile.name.replace(/\s/g,'').toLowerCase();
        userNames.push(userName);
    }

    let boards = PostBoard.find({}).fetch();

    //make another copy just for PostInput (to include the ! in the auto-complete drop-down) - see PostInput.jsx
    let boardsCopy = [];
    let bLength = boards.length;
    for (let i = 0; i < bLength; i++) {
        let b = boards[i];
        boardsCopy.push(b.name);
        boardsCopy.push(b.name + '!');
    }

    return {
        boards,
        boardsCopy,
        userNames,
        ready,
        thisUserBoardId
    };
})(MessageBoard);