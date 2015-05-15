'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Subgoal Schema
 */
var SubgoalSchema = new Schema({
  create: {
    type: Date,
    default: Date.now
  },
  content: {
    type: String,
    default: '',
    trim: true,
    required: 'Content must be provided'
  },
  creator: {
    type: Schema.ObjectId,
    ref: 'User',
    required: 'Please login to create a goal'
  },
  expires: {
    type: Date,
    required: 'Make your goals SMART'
  }
});

exports.SubgoalSchema;
mongoose.model('Subgoal', SubgoalSchema);