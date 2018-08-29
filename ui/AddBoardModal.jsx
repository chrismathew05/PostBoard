//Core React+Meteor imports
import React, {Component} from 'react';
import PropTypes from 'prop-types';

//Custom Component Imports
import {PostBoard} from "../../../api/PostBoard.js";

//Semantic UI Imports
import {Button, Modal, Input, Popup, Form} from 'semantic-ui-react';

//Other
import {toast} from 'react-toastify';

export default class AddBoardModal extends Component {
    state = { postBoardName: '', open: false };

    addPostBoard = () => {
        const boards = this.props.boards;
        const boardsLength = boards.length;

        let newBoard = this.state.postBoardName.replace(/\s/g,''); // No inner or outer spaces

        // No exclamation marks
        if(newBoard.includes('!')) {
            toast.error('Board name cannot include "!"');
            return;
        }

        // Check if board already exists
        for (let i = 0; i < boardsLength; i++) {
            let boardName = boards[i].name;
            if(newBoard.toLowerCase() === boardName.toLowerCase()) {
                toast.error('Board already exists!');
                return;
            }
        }
        Meteor.call('PostBoard.insert', { name: newBoard });
        this.setState({ postBoardName: '', open: false });
        toast.success('Board added!');
    };

    // Submit board on enter
    handleKeyDown = (e) => {
        let code = (e.keyCode ? e.keyCode : e.which);
        if(code === 13) {
            e.preventDefault();
            this.addPostBoard();
        }
    };

    render() {
        return (
            <span>
                {/*Button to trigger Modal*/}
                <Popup
                    inverted
                    trigger={<Button circular color='green' icon='add' onClick={() => this.setState({open: true})}/>}
                    content='Add Board'
                    position='bottom center'
                />

                <Modal size='mini' open={this.state.open} onClose={() => this.setState({open: false})}>
                  <Modal.Header>Add Post Board</Modal.Header>
                  <Modal.Content>
                    <Form>
                        <Form.Input
                            autoFocus
                            icon='plus'
                            iconPosition='left'
                            placeholder='Board Name'
                            value={this.state.postBoardName}
                            onChange={(e, {value}) => this.setState({postBoardName: value})}
                            onKeyPress={this.handleKeyDown}
                        />
                    </Form>
                  </Modal.Content>
                  <Modal.Actions>
                    <Button positive content='Submit' onClick={this.addPostBoard}/>
                  </Modal.Actions>
                </Modal>
            </span>
        );
    }
}

AddBoardModal.propTypes = {
    boards: PropTypes.array
};