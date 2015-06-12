'use strict';

/**
 * Created by:    Robin Hansma (robin@ihatestatistics.com)
 * Date:          29-5-2015
 */

var TinCan = require('tincanjs'),
    mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    User = mongoose.model('User'),
    Goal = mongoose.model('Goal');

var tincan = new TinCan(
  {
    recordStores: [
      {
        endpoint: process.env.LRS_ENDPOINT,
        username: process.env.LRS_USERNAME,
        password: process.env.LRS_PASSWORD,
        allowFail: false
      }
    ]
  }
);

function _sendStatement(verb, userEmail, userRole, userName, objectType, requestUrl, objectTitle, origin, rating) {
  var statement = {
    'actor': {
      'mbox': 'mailto:' + userEmail,
      'name': userName
    },
    'verb': {
      'id': verb
    },
    'target': {
      'id': requestUrl,
      'objectType': 'Activity',
      'definition': {
        'name': {
          'en-US': objectType
        }
      }
    },
    'context': {
      'extensions': {
        'http://goalsetting.uva.nl/user/role': userRole
      }
    }
  };

  /* Add origin if set */
  if(typeof origin !== 'undefined') {
    statement.target.definition.extensions = {};
    statement.target.definition.extensions['http://goalsetting.uva.nl/goal/origin'] = origin;
  }

  /* Add origin if set */
  if(typeof objectTitle !== 'undefined') {
    statement.target.definition.description = {};
    statement.target.definition.description['en-US'] = objectTitle;
  }

  /* Add rating if set */
  if(typeof rating !== 'undefined') {
    statement.target.definition.extensions['http://goalsetting.uva.nl/goal/rating'] = rating;
  }

  tincan.sendStatement(statement, function(results, statement) {
    errorHandler.log(results, 'info');
    errorHandler.log(statement, 'info');
  });
}

/**
 * Send statement on goal/subgoal actions
 * @param email
 * @param goal
 * @param verb
 * @param requestUrl
 * @param type
 */
exports.sendStatementOnGoal = function(email, goal, verb, requestUrl, type, rating) {
  User.find({'email': email}).exec(function(err, user) {
    if(err) {
      errorHandler.log(err);
    } else {
      Goal.findById(goal).populate('creator').exec(function(err, goal) {
        if(err) {
          errorHandler.log(err);
        }
        else {
          _sendStatement(verb, user[0].email, user[0].roles[0], user[0].displayName, type, requestUrl, goal.title, goal.creator.displayName, rating);
        }
      });
    }
  });
};

exports.sendStatementOnUser = function(email, verb, requestUrl, objectType) {
  User.find({'email': email}).exec(function(err, user) {
    if(err) {
      errorHandler.log(err);
    } else {
      _sendStatement(verb, email, user[0].roles[0], user[0].displayName, objectType, requestUrl);
    }
  });
};