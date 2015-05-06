'use strict';

/**
 * Created by:    Robin Hansma (robin@ihatestatistics.com)
 * Date:          5-5-2015
 */

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Goal = mongoose.model('Goal'),
    _ = require('lodash');

/**
 * Create a goal
 */
exports.create = function(req, res) {
  var goal = new Goal(req.body);
  goal.creator = req.user;

  goal.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(goal);
    }
  });
};

/**
 * Show the current goal
 */
exports.read = function(req, res) {
  res.json(req.goal);
};

/**
 * Update a goal
 */
exports.update = function(req, res) {
  var goal = req.goal;

  goal = _.extend(goal, req.body);

  goal.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(goal);
    }
  });
};

/**
 * Delete an goal
 */
exports.delete = function(req, res) {
  var goal = req.goal;

  goal.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(goal);
    }
  });
};

/**
 * List of Goals
 */
exports.list = function(req, res) {
  Goal.find().sort('-created').populate('creator', 'displayName').exec(function(err, goals) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(goals);
    }
  });
};

/**
 * Goal middleware
 */
exports.goalByID = function(req, res, next, id) {
  Goal.findById(id).populate('user', 'displayName').exec(function(err, goal) {
    if (err) return next(err);
    if (!goal) return next(new Error('Failed to load goal ' + id));
    req.goal = goal;
    next();
  });
};

/**
 * Goal authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
  if (req.goal.user.id !== req.user.id) {
    return res.status(403).send({
      message: 'User is not authorized'
    });
  }
  next();
};