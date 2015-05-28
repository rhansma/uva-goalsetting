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
    _ = require('lodash'),
    mail = require('./mail.server.controller.js');


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
      goals.push(usergoals[i].goal._id);
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
 * Publish all goals, model checks if rating is above 5.5, so not necessary to check here
 * @param req
 * @param res
 */
exports.publish = function(req, res) {
  Goal.find().exec(function(err, goals) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      _.each(goals, function(goal, index, list) {
        goal.published = true;
        goal.save();

        /* If this was the last goal, send mail and respond with 200 */
        if(index === (_.size(list) - 1)) {
          /* Send mail to students */
          var subject = 'Goals are published';
          var body = '<html><body><h1>The goals are published</h1><p>It is now possible to commit to goals, ' +
            'reject goals and report on the status of your goals. Follow this <a href="' + process.env.APP_URL +
            '">link</a> (' + process.env.APP_URL + ') to commit to goals.</p></body></html>';
          mail.mailToAll(subject, body);

          res.status(200).send();
        }
      });
    }
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