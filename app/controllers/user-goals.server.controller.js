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

mongoose.set('debug', true);
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
            var requestUrl = req.protocol + '://' + req.get('host') + req.url;
            tincan.sendStatementOnGoal(req.user.email, goal._id, process.env.TINCAN_COMMITTED, requestUrl, 'Goal');
          }

          res.json(userGoals);
        }
      });

    }
  });
};

exports.addTag = function(req, res) {
  var userGoal = req.userGoal;

  userGoal.tags.push(req.params.tag);
  userGoal.save(function(err) {
    if(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var requestUrl = req.protocol + '://' + req.get('host') + req.url;
      tincan.sendStatementOnGoal(req.user.email, userGoal.goal, process.env.TINCAN_TAG_ADDED, requestUrl, 'Goal');
      res.json(userGoal);
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
      /* Send tincan statement to LRS */
      if(userGoal.finished) {
        var date = new Date();
        userGoal.statusChangeDate = date;
        userGoal.status = 'finished';

        var requestUrl = req.protocol + '://' + req.get('host') + req.url;
        tincan.sendStatementOnGoal(req.user.email, userGoal.goal, process.env.TINCAN_COMPLETED, requestUrl, 'Goal');
      }
    }

    /* Check if any subgoals are finished and send to LRS */
    _.each(userGoal.subgoals, function(subgoal) {
      _.each(oldGoal.subgoals, function(oldSubgoal) {
        if(subgoal.finished && oldSubgoal.finished === false) {
          var requestUrl = req.protocol + '://' + req.get('host') + req.url;
          tincan.sendStatementOnGoal(req.user.email, userGoal.goal, process.env.TINCAN_COMPLETED, requestUrl, 'Subgoal');
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

exports.finish = function(req, res) {
  var userGoal = req.userGoal;
  userGoal.status = 'finished';
  userGoal.statusChangeDate = new Date();

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

exports.finishSubgoal = function(req, res) {
  var userGoal = req.userGoal;

  for(var i = 0; i < userGoal.subgoals.length; i++) {
    if(userGoal.subgoals[i]._id.toString() === req.params.subGoalId) {
      userGoal.subgoals[i].finished = true;
    }
  }

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
 * Abort a goal
 * @param req
 * @param res
 */
exports.abort = function(req, res) {
  var userGoal = req.userGoal;
  var userGoalGroup = userGoal.group;
  userGoal.status = 'aborted';
  userGoal.statusChangeDate = new Date();

  /* Remove group if was grouped */
  if(userGoal.grouped === 1) {
    userGoal.grouped = 0;
  }

  userGoal.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var requestUrl = req.protocol + '://' + req.get('host') + req.url;
      tincan.sendStatementOnGoal(req.user.email, userGoal.goal, process.env.TINCAN_ABORTED, requestUrl, 'Goal');
      UserGoals.find({$and: [
          {'group': userGoalGroup},
          {'group': {$exists: true}}
        ]}).exec(function(err, goals) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          if(goals.length > 2) {
            /* Find group parent */
            UserGoals.findOne({'grouped': {$gt: 0}, 'group': userGoalGroup}).exec(function(err, groupParent) {
              if(err) {
                return res.status(400).send({
                  message: errorHandler.getErrorMessage(err)
                });
              } else {
                /* Catch error condition if groupparent not found */
                if(groupParent.length === 0) {
                  return res.status(400).send({
                    message: errorHandler.getErrorMessage('Error handling call')
                  });
                }

                /* If the aborted goal is the group parent, move grouped - 1 to new parent */
                if(groupParent._id.toString() === userGoal._id.toString()) {
                  UserGoals.update({'group': userGoalGroup, 'status': 'committed'},{$set: {'grouped': groupParent.grouped - 1}}).exec(function(err) {
                    if(err) {
                      return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                      });
                    } else {
                      UserGoals.update({'_id': userGoal._id}, {$unset: {group: 1}}).exec(function(err) {
                        if(err) {
                          return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                          });
                        } else {
                          res.json(userGoal);
                        }
                      });
                    }
                  });
                /* Just lower the number of group members */
                } else {
                  groupParent.grouped -= 1;
                  groupParent.save(function(err) {
                    if(err) {
                      return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                      });
                    } else {
                      UserGoals.update({'_id': userGoal._id}, {$unset: {group: 1}, $set: {grouped: 0}}).exec(function(err) {
                        if(err) {
                          return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                          });
                        } else {
                          res.json(userGoal);
                        }
                      });
                    }
                  });
                }
              }
            });
          } else {
            /* Remove group from both linked goals */
            UserGoals.update({'_id': {$in: goals}}, {$unset: {group: 1}, $set: {grouped: 0}}, {multi: true}).exec(function (err) {
              if(err) {
                return res.status(400).send({
                  message: errorHandler.getErrorMessage(err)
                });
              } else {
                res.json(userGoal);
              }
            });
          }
        }
      });
    }
  });
};

/**
 * List of User goals
 */
exports.list = function(req, res) {
  UserGoals.find({user: req.user, status: {$nin: ['rejected', 'aborted']}, $or: [{group: null}, {grouped:{$gt: 0}}]}).populate('goal').exec(function(err, userGoals) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var requestUrl = req.protocol + '://' + req.get('host') + req.url;
      tincan.sendStatementOnUser(req.user.email, process.env.TINCAN_VIEW, requestUrl, 'personal goal list');
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
  UserGoals.find({group: req.param('userGoalGroupId'), status: 'committed'}).populate('goal').sort('-created').exec(function(err, userGoals) {
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
  /* Count completed and aborted goals */
  UserGoals.aggregate(
    {
      $match: {
        'statusChangeDate': {$exists: true},
        'user': req.user._id
      }
    },
    {
      $sort: {
        'statusChangeDate': -1
      }
    },
    {
      $group: {
        _id: {
          status: '$status',
          day: {$dayOfMonth: '$statusChangeDate'},
          month: {$month: '$statusChangeDate'},
          year: {$year: '$statusChangeDate'}
        },
        total: {$sum: 1}
      }
    }).exec(function(err, finished) {
      if (err) {
        errorHandler.log(err);
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        result.finished = finished;

        /* Get commited goals per date */
        UserGoals.aggregate(
          {
            $match: {
              'committedDate': {$exists: true},
              'user': req.user._id
            }
          },
          {
            $sort: {
              'committedDate': -1
            }
          },
          {
          $group: {
            _id: {
              day: {$dayOfMonth: '$committedDate'},
              month: {$month: '$committedDate'},
              year: {$year: '$committedDate'}
            },
            total: {$sum: 1}
          }
        }).exec(function(err, committed){
            if (err) {
              errorHandler.log(err);
              return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              result.committed = committed;

              /* Get totals */
              UserGoals.aggregate({
                    $match: {
                      'user': req.user._id
                    }
                  },
                  {
                $group: {
                  _id: '$status',
                  total: {$sum: 1}
                }
              }).exec(function(err, stats) {
                if (err) {
                  errorHandler.log(err);
                  return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                  });
                } else {
                  result.statistics = stats;
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
 * Middleware for retrieving usergoals by subgoal id
 * @param req
 * @param res
 * @param next
 * @param id
 */
exports.userGoalBySubGoalID = function(req, res, next, id) {
  UserGoals.findOne({'subgoals._id': id, 'user': req.user._id}).exec(function(err, goal) {
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
