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
    UserGoals = mongoose.model('UserGoals'),
    _ = require('lodash');


/**
 * Create a goal
 */
exports.create = function(req, res) {
  var goal = new Goal(req.body);
  goal.creator = req.user;
  goal.finished = false;

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
 * Base method for updating, used for both update methods, so normal update can filter
 * @param req
 * @param res
 * @private
 */
function _update(goal, res) {
  goal.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(goal);
    }
  });
}

/**
 * Update a goal
 */
exports.update = function(req, res) {
  var goal = req.goal;

  /* Omit rating property, may only be changed by teacher */
  goal = _.extend(goal, _.omit(req.body, ['rating', 'committed', 'finished']));
  _update(goal, res);
};

/**
 * Update by teacher, for also updating rating
 * @param req
 * @param res
 */
exports.updateByTeacher = function(req, res) {
  var goal = req.goal;

  goal = _.extend(goal, req.body);
  _update(goal, res);
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
 * Find and return all approved goals which are not approved or rejected by the user
 * @param req
 * @param res
 */
exports.approved = function(req, res) {
  /* Find all goals committed or rejected */
  UserGoals.find({'user': req.user}, {goal: 1}).exec(function(err, usergoals) {
    var goals = [];
    for(var i in usergoals){
      goals.push(usergoals[i].goal);
    }

    /* Find and return all goals not already committed or rejected */
    Goal.find({_id: {$nin: goals}}).where('rating').gt(5).exec(function(err, goals) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(goals);
      }
    });
  });
};

/**
 * Goal middleware
 */
exports.goalByID = function(req, res, next, id) {
  Goal.findById(id).populate('creator', 'displayName').exec(function(err, goal) {
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
  if (req.goal.creator.id !== req.user.id) {
    return res.status(403).send({
      message: 'User is not authorized'
    });
  }
  next();
};