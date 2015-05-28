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
  created: {
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
    required: 'Please login to create a subgoal'
  },
  expires: {
    type: Date,
    required: 'Make your goals SMART',
    validate: [dateInFutureValidation, 'Make sure your expiry date is in the future']
  },
  finished: {
    type: Boolean,
    default: false
  },
  finishedDate: {
    type: Date
  }
});

/* Make sure date is in future */
function dateInFutureValidation(value) {
  return new Date() < value;
}

exports.SubgoalSchema; // jshint ignore:line
mongoose.model('Subgoal', SubgoalSchema);