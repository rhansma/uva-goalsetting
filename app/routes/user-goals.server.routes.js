'use strict';

/**
 * Created by:    Robin Hansma (robin@ihatestatistics.com)
 * Date:          15-5-2015
 */

var users = require('../../app/controllers/users.server.controller.js'),
    userGoals = require('../../app/controllers/user-goals.server.controller.js');

module.exports = function(app) {
	// User Goals routes
  app.route('/user/goals')
      .get(users.requiresLogin, userGoals.list)
      .post(users.requiresLogin, userGoals.create);

  app.route('/user/goals/:userGoalId')
      .put(users.requiresLogin, userGoals.hasAuthorization, userGoals.update)
      .get(users.requiresLogin, userGoals.hasAuthorization, userGoals.read);

  app.param('userGoalId', userGoals.userGoalByID);
};