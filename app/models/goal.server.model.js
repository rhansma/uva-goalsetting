'use strict';
/**
 * Created by: Robin Hansma (robin@ihatestatistics.com)
 * Date:       5-5-2015
 */

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    mongoosePaginate = require('mongoose-paginate');

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
    required: 'Goal cannot be blank'
  },
  creator: {
    type: Schema.ObjectId,
    ref: 'User',
    required: 'Please login to create a goal'
  },
  expires: {
    type: Date,
    required: 'Set a deadline for this goal, the date must be in the future.'
  },
  rating: {
    type: Number,
    min: 1,
    max: 10
  },
  committed: {
    type: Number,
    min: 0,
    default: 0
  },
  published: {
    type: Boolean,
    default: false
  },
  private: {
    type: Boolean,
    default: false
  }
});

/**
 * Run some validation before saving/updating
 */
GoalSchema.pre('validate', function(next) {
  /* Make sure goal is only published after a minimum rating of 5.5 */
  if (this.published && this.rating < 5.5) {
    this.published = false;
  }

  next();
});

GoalSchema.plugin(mongoosePaginate, {});
mongoose.model('Goal', GoalSchema);