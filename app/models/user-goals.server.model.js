'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
  SubgoalSchema = require('./subgoal.server.model.js');

/**
 * UserGoals Schema
 */
var UserGoalsSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: 'Please login to commit or reject the goal'
  },
  goal: {
    type: Schema.ObjectId,
    ref: 'Goal',
    required: 'Goal is required'
  },
  status: {
    type: String,
    enum: ['committed', 'rejected', 'aborted', 'finished', 'expired'],
    required: 'Status is required'
  },
  grouped: {
    type: Number,
    min: 0,
    default: 0
  },
  group: {
    type: Schema.ObjectId,
    ref: 'UserGoalGroups'
  },
  tags: [{
    type: String,
    trim: true
  }],
  reminded: {
    type: Date
  },
  finished: {
    type: Boolean,
    default: false
  },
  statusChangeDate: {
    type: Date
  },
  committedDate: {
    type: Date,
    default: Date.now
  },
  subgoals: [SubgoalSchema]
});
UserGoalsSchema.index({user: 1, goal: 1});

mongoose.model('UserGoals', UserGoalsSchema);