'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    errorHandler = require('./errors.server.controller'),
    UserGoals = mongoose.model('UserGoals'),
    Goal = mongoose.model('Goal'),
    tincan = require('./tincan.server.controller.js');

/**
 * Create a User goal
 */
exports.create = function(req, res) {
  var goal = req.body.goal;
  var userGoals = new UserGoals(_.omit(req.body, 'goal'));
  userGoals.user = req.user;
  userGoals.goal = goal._id;

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
          /* Send statement to LRS if committed to goal */
          if(userGoals.status === 'committed') {
            tincan.committedToGoal(req.user.email, req.user.displayName);
          }

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

  UserGoals.findById(userGoal._id).exec(function(err, oldGoal) {
    /* Changed finished date if finished value is flipped */
    if(oldGoal.finished !== userGoal.finished) {
      userGoal.finishedDate = new Date();

      /* Send tincan statement to LRS */
      if(userGoal.finished) {
        tincan.finishedGoal(req.user.email, req.user.displayName);
      }
    }

    /* Check if any subgoals are finished and send to LRS */
    _.each(userGoal.subgoals, function(subgoal) {
      _.each(oldGoal.subgoals, function(oldSubgoal) {
        if(subgoal.finished && oldSubgoal.finished === false) {
          tincan.progressedGoal(req.user.email, req.user.displayName);
        }
      });
    });

    userGoal.save(function(err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(userGoal);
      }
    });
  });
};

/**
 * Abort a goal
 * @param req
 * @param res
 */
exports.abort = function(req, res) {
  var userGoal = req.userGoal;
  userGoal.status = 'aborted';

  userGoal.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      tincan.abortedGoal(req.user.email, req.user.displayName);
      res.json(userGoal);
    }
  });
};

/**
 * List of User goals
 */
exports.list = function(req, res) {
  UserGoals.find({user: req.user, status: 'committed', $or: [{group: null}, {grouped:{$gt: 0}}]}).populate('goal').sort('-created').exec(function(err, userGoals) {
    if (err) {
      console.log(err);
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

exports.getGoalStatistics = function(req, res) {
  var result = {};
  /* Count completed goals */
  UserGoals.aggregate(
    {
      $match: {
        'finishedDate': {$exists: true},
        'user': req.user._id
      }
    },
    {
      $sort: {
        'finishedDate': -1
      }
    },
    {
      $group:  {
        _id : {
          finishedDate: {
            day: {$dayOfMonth: 'finishedDate'},
            month: {$month: 'finishedDate'},
            year: {$year: 'finishedDate'}
          }
        },
        total: {$sum: 1}
      }
    }).exec(function(err, finished) {
      console.log(err);
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        result.finished = finished;

        /* Count total number of goals */
        UserGoals.count({user: req.user._id}).exec(function(err, count) {
          console.log(err);
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            result.total = count;

            /* Get number of aborted goals */
            UserGoals.count({user: req.user._id, status: 'aborted'}).exec(function(err, count) {
              console.log(err);
              if (err) {
                return res.status(400).send({
                  message: errorHandler.getErrorMessage(err)
                });
              } else {
                result.aborted = count;
                res.json(result);
              }
            });
          }
        });
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
  UserGoals.findById(id).populate('goal').exec(function(err, goal) {
    if (err) return next(err);
    if (!goal) return next(new Error('Failed to load user goal ' + id));
    req.userGoal = goal;
    next();
  });
};

/**
 * Check if user is creator of user goal
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.hasAuthorization = function(req, res, next) {
  if (req.userGoal.user.toString() !== req.user.id) {
    return res.status(403).send({
      message: 'User is not authorized'
    });
  }
  next();
};
