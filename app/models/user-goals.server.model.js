'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
  GoalSchema = require('./goal.server.model.js');

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
  goal: GoalSchema,
  status: {
    type: String,
    enum: ['committed', 'rejected'],
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
  }]
});
UserGoalsSchema.index({user: 1, goal: 1});

mongoose.model('UserGoals', UserGoalsSchema);