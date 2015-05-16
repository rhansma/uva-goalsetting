'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    ObjectId = require('mongoose').Types.ObjectId,
    errorHandler = require('./errors.server.controller'),
    UserGoals = mongoose.model('UserGoals'),
    UserGoalGroups = mongoose.model('UserGoalGroups');

/**
 * Create a User goal group
 */
exports.create = function(req, res) {
  var userGoalGroups = new UserGoalGroups(req.body);
  userGoalGroups.user = req.user;

  /* Save goal group */
  userGoalGroups.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      /* Update user goals with group id and increment parent*/
      UserGoals.update({_id: userGoalGroups.parent}, {$set: {group: userGoalGroups._id}, $inc: {grouped: 1}}, function(err) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          UserGoals.update({_id: userGoalGroups.children[0]}, {$set: {group: userGoalGroups._id}}, function (err) {
            if (err) {
              return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              res.json(userGoalGroups);
            }
          });
        }
      });
    }
  });
};

/**
 * Show the current User goal group
 */
exports.read = function(req, res) {

};

/**
 * Update a User goal group
 */
exports.update = function(req, res) {

};

/**
 * Delete an User goal group
 */
exports.delete = function(req, res) {

};

/**
 * List of User goal groups
 */
exports.list = function(req, res) {

};