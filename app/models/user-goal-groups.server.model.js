'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * UserGoalGroups Schema
 */
var UserGoalGroupsSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: 'Please login to group goals'
  },
  parent: {
    type: Schema.ObjectId,
    ref: 'UserGoals',
    required: 'A parent is required'
  },
  children: [{
    type: Schema.ObjectId,
    ref: 'UserGoals',
    required: 'At least one child must be present'
  }]
});

mongoose.model('UserGoalGroups', UserGoalGroupsSchema);