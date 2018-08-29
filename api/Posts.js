import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import {_} from 'meteor/underscore';

import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';

export const Posts = new Mongo.Collection('Posts');

// SCHEMA
Posts.schema = new SimpleSchema({
    _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    content: {
        type: String,
        max: 10000
    },
    timestamp: {
        type: String
    },
    important: {
        type: Boolean
    },
    postBoardId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    }
});
Posts.attachSchema(Posts.schema);

// PUBLICATIONS
if (Meteor.isServer) {
    Meteor.publish('boardPosts', (activeBoardId) => {
        return Posts.find({ postBoardId: activeBoardId }, { fields: { content:1, timestamp:1, important:1 } });
    });
}

// METHODS
Meteor.methods({
    'Posts.insert'(obj) {
        if (!this.userId) {
            throw new Meteor.Error('Not Authorized!');
        }

        Posts.insert({
            ...obj,
        });
    },

    'Posts.remove'(objId) {
        if (!this.userId) {
            throw new Meteor.Error('Not Authorized!');
        }

        Posts.remove(objId)
    },
});

// SECURITY
Posts.deny({
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
                'Posts.insert',
                'Posts.remove',
            ], name);
        },
        // Rate limit per connection ID
        connectionId() {
            return true;
        }
    }, 20, 1000);
}