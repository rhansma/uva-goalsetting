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

function _sendStatement(email, name, actorType, verb, type, requestUrl, action) {
  tincan.sendStatement(
    {
      actor: {
        mbox: 'mailto:' + email,
        name: name,
        type: actorType
      },
      verb: {
        id: verb
      },
      target: {
        id: process.env.APP_URL,
        objectType: type,
        url: requestUrl,
        displayName: action,
        definition: {
          name: {
            'en-US': 'Goal'
          },
          description: {
            'en-US': 'Set goals to improve learning results'
          },
          type: 'http://adlnet.gov/expapi/activities/objective'
        }
      }
    }, function(results, statement) {}); // Can be used for logging, last parameter is the exact statement sent to LRS
}

function _sendStatementI(verb, userEmail, userRole, userName, objectType, requestUrl, objectTitle, origin) {
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
        },
        'description': {
          'en-US': objectTitle
        }
      }
    },
    'context': {
      'extensions': {
        'http://localhost:3000/user/role': userRole
      }
    }
  };

  /* Add origin if set */
  if(typeof origin !== 'undefined') {
    statement.target.definition['extensions'] = {};
    statement.target.definition.extensions['http://localhost:3000/goal/origin'] = origin;
  }

  tincan.sendStatement(statement, function(results, statement) {
    errorHandler.log(results, 'info');
    errorHandler.log(statement, 'info');
  });
}

/**
 * Send tincan statement for creation of goal
 * @param email
 * @param goal
 * @param requestUrl (url of the goal)
 * @param type (goal/subgoal)
 */
exports.createdGoal = function(email, goal, requestUrl, type) {
  User.find({'email': email}).exec(function(err, user) {
    if(err) {
      errorHandler.log(err);
    } else {
      Goal.findById(goal).populate('creator').exec(function(err, goal) {
        if(err) {
          errorHandler.log(err);
        }
        else {
         _sendStatementI(process.env.TINCAN_CREATED, user[0].email, user[0].roles[0], user[0].displayName, type, requestUrl, goal.title, goal.creator.displayName);
        }
      });
    }
  });
};

exports.committedToGoal = function(email, name) {
  var verb = 'http://adlnet.gov/expapi/verbs/registered';

  _sendStatement(email, name, verb);
};

exports.finishedGoal = function(email, name) {
  var verb = 'http://adlnet.gov/expapi/verbs/completed';

  _sendStatement(email, name, verb);
};

exports.rejectedGoal = function(email, name) {
  var verb = 'http://adlnet.gov/expapi/verbs/voided';

  _sendStatement(email, name, verb);
};

exports.progressedGoal = function(email, name) {
  var verb = 'http://adlnet.gov/expapi/verbs/progressed';

  _sendStatement(email, name, verb);
};

exports.abortedGoal = function(email, name) {
  var verb = 'http://adlnet.gov/expapi/verbs/suspended';

  _sendStatement(email, name, verb);
};

exports.failedGoal = function(email, name) {
  var verb = 'http://adlnet.gov/expapi/verbs/failed';

  _sendStatement(email, name, verb);
};