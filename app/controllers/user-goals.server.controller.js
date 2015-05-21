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
  res.json(req.userGoal);
};

/**
 * Update a User goal
 */
exports.update = function(req, res) {
  var tags = _.pluck(req.body.tags, 'text');
  var requestBody = _.extend(_.omit(req.body, 'tags'), {tags: tags});
  var userGoal = _.extend(req.userGoal, requestBody);

  userGoal.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(userGoal);
    }
  });
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
  UserGoals.find({user: req.user, status: 'committed', $or: [{group: null}, {grouped:{$gt: 0}}]}).sort('-created').exec(function(err, userGoals) {
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
  UserGoals.find({group: req.param('userGoalGroupId')}).sort('-created').exec(function(err, userGoals) {
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
 * Middleware for userGoals
 * @param req
 * @param res
 * @param next
 * @param id
 */
exports.userGoalByID = function(req, res, next, id) {
  UserGoals.findById(id).exec(function(err, goal) {
    if (err) return next(err);
    if (!goal) return next(new Error('Failed to load user goal ' + id));
    req.userGoal = goal;
    next();
  });
};