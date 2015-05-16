'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

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
    ref: 'Goal'
  },
  status: {
    type: String,
    enum: ['committed', 'rejected'],
    required: 'Status is required'
  }
});
UserGoalsSchema.index({user: 1, goal: 1});

mongoose.model('UserGoals', UserGoalsSchema);