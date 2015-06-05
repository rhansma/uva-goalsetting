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
  expires: {
    type: Date,
    required: 'Make your goals SMART'
  },
  finished: {
    type: Boolean,
    default: false
  },
  finishedDate: {
    type: Date
  }
});

module.exports = SubgoalSchema;
mongoose.model('Subgoal', SubgoalSchema);