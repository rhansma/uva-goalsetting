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

/* Set defaults values for tincan statements */
process.env.TINCAN_CREATED = process.env.TINCAN_CREATED || 'http://adlnet.gov/expapi/verbs/created';
process.env.TINCAN_COMMITTED = process.env.TINCAN_COMMITTED || 'http://activitystrea.ms/schema/1.0/accept';
process.env.TINCAN_COMPLETED = process.env.TINCAN_COMPLETED || 'http://activitystrea.ms/schema/1.0/complete';
process.env.TINCAN_ABORTED = process.env.TINCAN_ABORTED || 'http://activitystrea.ms/schema/1.0/cancel';
process.env.TINCAN_UPDATED = process.env.TINCAN_UPDATED || 'http://activitystrea.ms/schema/1.0/update';
process.env.TINCAN_LOGIN = process.env.TINCAN_LOGIN || 'https://brindlewaye.com/xAPITerms/verbs/loggedin/';
process.env.TINCAN_VIEW = process.env.TINCAN_VIEW || 'http://id.tincanapi.com/verb/viewed';
process.env.TINCAN_APPROVED = process.env.TINCAN_APPROVED || 'http://activitystrea.ms/schema/1.0/approve';
process.env.TINCAN_RATING = process.env.TINCAN_RATING || 'http://id.tincanapi.com/verb/rated';


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

function _sendStatement(verb, userEmail, userRole, userName, objectType, requestUrl, objectTitle, origin, goalInformation) {
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

  statement.target.definition.extensions = {};
  /* Add origin if set */
  if(typeof origin !== 'undefined') {
    statement.target.definition.extensions['http://goalsetting.uva.nl/goal/origin'] = origin;
  }

  /* Add public/private if set */
  if(typeof goalInformation.publicOrPrivate !== 'undefined') {
    statement.target.definition.extensions['http://goalsetting.uva.nl/goal/publicOrPrivate'] = goalInformation.publicOrPrivate;
  }

  /* Add deadline if set */
  if(typeof goalInformation.deadline !== 'undefined') {
    statement.target.definition.extensions['http://goalsetting.uva.nl/goal/deadline'] = goalInformation.deadline;
  }

  /* Add rating if set */
  if(typeof goalInformation.rating !== 'undefined') {
    statement.target.definition.extensions['http://goalsetting.uva.nl/goal/rating'] = rating;
  }

  /* Add origin if set */
  if(typeof objectTitle !== 'undefined') {
    statement.target.definition.description = {};
    statement.target.definition.description['en-US'] = objectTitle;
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
 * @param goalInformation (rating, deadline, publicOrPrivate)
 */
exports.sendStatementOnGoal = function(email, goal, verb, requestUrl, type, goalInformation) {
  console.log(goalInformation);
  User.find({'email': email}).exec(function(err, user) {
    if(err) {
      errorHandler.log(err);
    } else {
      Goal.findById(goal).populate('creator').exec(function(err, goal) {
        if(err) {
          errorHandler.log(err);
        }
        else {
          _sendStatement(verb, user[0].email, user[0].roles[0], user[0].displayName, type, requestUrl, goal.title, goal.creator.displayName, goalInformation);
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