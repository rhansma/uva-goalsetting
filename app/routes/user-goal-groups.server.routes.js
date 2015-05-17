'use strict';

/**
 * Created by:    Robin Hansma (robin@ihatestatistics.com)
 * Date:          16-5-2015
 */

var users = require('../../app/controllers/users.server.controller.js'),
  userGoals = require('../../app/controllers/user-goals.server.controller.js'),
  userGoalGroups = require('../../app/controllers/user-goal-groups.server.controller.js');

module.exports = function(app) {
	// User goal groups
  app.route('/user/goal/groups')
    .post(users.requiresLogin, userGoalGroups.create);

  app.route('/user/goal/groups/:userGoalGroupId')
    .get(users.requiresLogin, userGoals.listByGroup)
    .put(users.requiresLogin, userGoalGroups.update);
};