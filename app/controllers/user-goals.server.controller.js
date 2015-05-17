'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    errorHandler = require('./errors.server.controller'),
    UserGoals = mongoose.model('UserGoals'),
    Goal = mongoose.model('Goal');

/**
 * Create a User goal
 */
exports.create = function(req, res) {
  var userGoals = new UserGoals(req.body);
  userGoals.user = req.user;

  userGoals.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      /* Increment committed field in goal */
      Goal.update({_id: userGoals.goal}, {$inc: {committed: 1}}, function(err) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.json(userGoals);
        }
      });

    }
  });
};

/**
 * Show the current User goal
 */
exports.read = function(req, res) {

};

/**
 * Update a User goal
 */
exports.update = function(req, res) {

};

/**
 * Delete an User goal
 */
exports.delete = function(req, res) {

};

/**
 * List of User goals
 */
exports.list = function(req, res) {
  UserGoals.find({user: req.user, status: 'committed', $or: [{group: null}, {grouped:{$gt: 0}}]}).populate('goal').sort('-created').exec(function(err, userGoals) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {

      res.json(userGoals);
    }
  });
};

/**
 * Get user goals by group id
 * @param req
 * @param res
 */
exports.listByGroup = function(req, res) {
  UserGoals.find({group: req.param('userGoalGroupId')}).populate('goal').sort('-created').exec(function(err, userGoals) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {

      res.json(userGoals);
    }
  });
};