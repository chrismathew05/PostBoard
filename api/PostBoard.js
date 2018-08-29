import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import {_} from 'meteor/underscore';

import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';

import {Posts} from "./Posts.js";


export const PostBoard = new Mongo.Collection('PostBoard');

// SCHEMA
PostBoard.schema = new SimpleSchema({
    _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    name: {
        type: String,
        unique: true,
        min: 1
    },
});
PostBoard.attachSchema(PostBoard.schema);

// PUBLICATIONS
if (Meteor.isServer) {
    Meteor.publish('allBoards', () => {
        return PostBoard.find({}, { fields: {name: 1} });
    });
}

// METHODS
Meteor.methods({
    'PostBoard.insert'(newPostBoard) {
        if (!this.userId) {
            throw new Meteor.Error('Not Authorized!');
        }

        // check for invalid "!" character via server side validation as well
        if (newPostBoard.name.includes("!")) {
            throw new Meteor.Error('Invalid character');
        }

        PostBoard.insert({
            ...newPostBoard,
        });
    },

    'PostBoard.remove'(postBoardId) {
        if (!this.userId) {
            throw new Meteor.Error('Not Authorized!');
        }

        PostBoard.remove(postBoardId);

        // Remove related posts
        let relatedPosts = Posts.find({postBoardId}, {fields: {_id:1}});
        relatedPosts.forEach((post) => Posts.remove(post._id));
    },
});

// SECURITY
PostBoard.deny({
    // DENY all client-side updates since we will be using methods to manage this collection
    insert() {
        return true;
    },
    update() {
        return true;
    },
    remove() {
        return true;
    },
});
// RATE LIMITING
if (Meteor.isServer) {
    DDPRateLimiter.addRule({
        name(name) {
            return _.contains([
                'PostBoard.insert',
                'PostBoard.remove',
            ], name);
        },
        // Rate limit per connection ID
        connectionId() {
            return true;
        }
    }, 20, 1000);
}