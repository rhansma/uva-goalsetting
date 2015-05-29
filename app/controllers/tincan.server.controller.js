'use strict';

/**
 * Created by:    Robin Hansma (robin@ihatestatistics.com)
 * Date:          29-5-2015
 */

var TinCan = require('tincanjs');

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

function _sendStatement(email, name, verb) {
  tincan.sendStatement(
    {
      actor: {
        mbox: 'mailto:' + email,
        name: name
      },
      verb: {
        id: verb
      },
      target: {
        id: process.env.APP_URL,
        objectType: 'Activity',
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
    }
  , function(results, statement) {}); // Can be used for logging, last parameter is the exact statement sent to LRS
}

exports.createdGoal = function(email, name) {
  var verb = 'http://adlnet.gov/expapi/verbs/created';

  _sendStatement(email, name, verb);
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