'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
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
  var requestBody = req.body;

  /* Find existing user goal group and push new child on children property */
  UserGoalGroups.findByIdAndUpdate(requestBody._id, {$push: {children: requestBody.child}}, function(err, userGoalGroup) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      /* Update user goals with group id and increment parent*/
      UserGoals.update({_id: userGoalGroup.parent}, {$inc: {grouped: 1}}, function(err) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          UserGoals.update({_id: requestBody.child}, {$set: {group: userGoalGroup._id}}, function (err) {
            if (err) {
              return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              res.json(userGoalGroup);
            }
          });
        }
      });
    }
  });
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