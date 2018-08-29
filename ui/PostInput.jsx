//Core React+Meteor imports
import React, {Component} from 'react';
import PropTypes from 'prop-types';

//Semantic UI Imports
import {Button} from "semantic-ui-react";
import moment from "moment";

//Other
import "@webscopeio/react-textarea-autocomplete/style.css";
import ReactTextareaAutocomplete from "@webscopeio/react-textarea-autocomplete";

// small stateless component, used as helper to ReactTextareaAutocomplete
// helps render items in drop-down
const Item = ({ entity }) => <div>{`${entity}`}</div>;

export default class PostInput extends Component {
    state = {
        inputContent: '',
        rows: 3 // workaround to resize text area since can't use semantic
    };

    handleChange = (e) => this.setState({ inputContent: e.target.value });

    inBoards = (str) => {
        let boards = this.props.boards;
        let boardsLength = this.props.boards.length;

        for (let i = 0; i < boardsLength; i++) {
            let boardName = boards[i].name.toLowerCase();
            if(boardName === str) {
                return boards[i]._id;
            }
        }

        return false;
    };

    submitContent = () => {
        let important = false;
        let postBoardId = this.props.thisUserBoardId;
        let inputContent = "   " + this.state.inputContent + "   "; //just in case

        //find last instance of [#
        const start = inputContent.lastIndexOf("[#") + 2;

        //i.e. a tag exists inside like [#General]
        if(start >= 0) {
            const end = inputContent.indexOf("]", start);
            if(end > start) {
                let postBoardName = inputContent.slice(start, end).toLowerCase(); //pull out inner part, i.e. General from [#General]
                const lastChar = postBoardName.slice(-1);

                if(lastChar === '!') {
                    important = true;
                    postBoardName = postBoardName.slice(0, -1); //remove last char from postBoardName
                }

                let tempBoardId = this.inBoards(postBoardName);
                if(tempBoardId) {
                    //we have a match, replace boardId and cut off everything after the tag
                    postBoardId = tempBoardId;
                    inputContent = inputContent.slice(0, start - 2).trim();
                }
            }
        }

        let newPost = {content: inputContent, timestamp: moment().format('MMMM Do YYYY, h:mm:ss a'), postBoardId, important};
        Meteor.call('Posts.insert', newPost);
        this.setState({inputContent: '', rows: 3});
    };

    // to increase height of textarea upon enter
    handleKeyDown = (e) => {
        let code = (e.keyCode ? e.keyCode : e.which);
        if(code === 13) {this.setState({ rows: this.state.rows + 1 });}
    };

    render() {
        return (
            <div>
                {/*see https://github.com/webscopeio/react-textarea-autocomplete/*/}
                <ReactTextareaAutocomplete
                    className="postsTextArea"
                    autoFocus
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeyDown}
                    value={this.state.inputContent}
                    loadingComponent={() => <span>Loading</span>}
                    rows={this.state.rows}
                    minChar={0}
                    trigger={{
                        "#": {
                            dataProvider: token => this.props.boardsCopy.filter(boardName => boardName.startsWith(token)), // data loaded into drop-down
                            component: Item, // component that handles rendering of each drop-down item (see line 17)
                            output: (item, trigger) => '[#' + item + ']' // whats outputted when item selected
                        }
                    }}
                />
                <br/>
                <Button onClick={this.submitContent} color='teal' floated='right'>Post</Button>
                <br/>
                <br/>
            </div>
        );
    }
}

PostInput.propTypes = {
    boards: PropTypes.array,
    boardsCopy: PropTypes.array,
    thisUserBoardId: PropTypes.string
};