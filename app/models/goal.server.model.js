'use strict';
/**
 * Created by: Robin Hansma (robin@ihatestatistics.com)
 * Date:       5-5-2015
 */

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Goal Schema
 */
var GoalSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    default: '',
    trim: true,
    required: 'Title cannot be blank'
  },
  content: {
    type: String,
    default: '',
    trim: true,
    required: 'Content must be provided'
  },
  creator: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  expires: {
    type: Date,
    required: 'Make your goals SMART'
  }
});

mongoose.model('Goal', GoalSchema);