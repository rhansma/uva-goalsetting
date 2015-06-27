'use strict';

/**
 * Created by:    Robin Hansma (robin@ihatestatistics.com)
 * Date:          5-5-2015
 */

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    paginate = require('express-paginate'),
    errorHandler = require('./errors.server.controller'),
    Goal = mongoose.model('Goal'),
    UserGoals = mongoose.model('UserGoals'),
    _ = require('lodash'),
    mail = require('./mail.server.controller.js'),
    tincan = require('./tincan.server.controller.js');


/**
 * Create a goal
 */
exports.create = function(req, res) {
  var goal = new Goal(req.body);
  goal.creator = req.user;
  goal.finished = false;
  goal.committed = 1;

  goal.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var requestUrl = req.protocol + '://' + req.get('host') + req.url;
      tincan.sendStatementOnGoal(req.user.email, goal._id, process.env.TINCAN_CREATED, requestUrl, 'Goal');

      var userGoals = new UserGoals();
      userGoals.status = 'committed';
      userGoals.user = req.user;
      userGoals.goal = goal._id;

      userGoals.save(function(err) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          tincan.sendStatementOnGoal(req.user.email, goal._id, process.env.TINCAN_COMMITTED, requestUrl, 'Goal');
          res.json(goal);
        }
      });
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
function _update(req, res, goal) {
  goal.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var requestUrl = req.protocol + '://' + req.get('host') + req.url;

      tincan.sendStatementOnGoal(req.user.email, goal._id, process.env.TINCAN_UPDATED, requestUrl, 'Goal');
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
  _update(req, res, goal);
};

/**
 * Update by teacher, for also updating rating
 * @param req
 * @param res
 */
exports.updateByTeacher = function(req, res) {
  var goal = req.goal;

  goal = _.extend(goal, req.body);

  /* Teacher rates goal, send statement to LRS */
  if(goal.rating !== null) {
    var requestUrl = req.protocol + '://' + req.get('host') + req.url;
    tincan.sendStatementOnGoal(req.user.email, goal._id, process.env.TINCAN_RATED, requestUrl, 'Goal', goal.rating);
  }
  _update(req, res, goal);
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
      UserGoals.remove({'goal': goal._id}).exec(function(err) {
        if(err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.json(goal);
        }
      });
    }
  });
};

/**
 * List of Goals
 */
exports.list = function(req, res) {
  console.log('test');
  Goal.paginate({'private': {$ne: true}}, req.query.page, req.query.limit, function(err, pageCount, results) {
    if (err) {
      console.log(err);
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      console.log('no err');
      res.format({
        json: function() {
          res.json([
            paginate.hasNextPages(req)(pageCount),
            results
          ]);
        }
      });
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
        var requestUrl = req.protocol + '://' + req.get('host') + req.url;
        tincan.sendStatementOnUser(req.user.email, process.env.TINCAN_VIEW, requestUrl, 'inspirational goal list');
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

        var requestUrl = req.protocol + '://' + req.get('host') + req.url;
        tincan.sendStatementOnGoal(req.user.email, goal._id, process.env.TINCAN_APPROVED, requestUrl, 'Goal');

        /* If this was the last goal, send mail and respond with 200 */
        if(index === (_.size(list) - 1)) {
          /* Send mail to students */
          var subject = 'Goals are published';
          var body = '<html><body><h1>The goals are published</h1><p>It is now possible to commit to goals, ' +
            'reject goals and report on the status of your goals. Follow this <a href="' + process.env.APP_URL +
            '">link</a> (' + process.env.APP_URL + ') to commit to goals.</p></body></html>';
          mail.mailToAll(subject, body);

          res.json(goals);
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

exports.paginate = function(req) {
  //req.query.page = req.params.page;
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