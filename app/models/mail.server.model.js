'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Mail Schema
 */
var MailSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  to: {
    type: Schema.ObjectId
  },
  toAll: {
    type: Boolean,
    required: 'Is this mail sent to all users?'
  },
  subject: {
    type: String,
    required: 'Subject is required'
  },
  body: {
    type: String,
    required: 'Body is required'
  }
});

mongoose.model('Mail', MailSchema);