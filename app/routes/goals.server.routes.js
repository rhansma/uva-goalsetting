'use strict';

/**
 * Created by:    Robin Hansma (robin@ihatestatistics.com)
 * Date:          5-5-2015
 */

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
    goals = require('../../app/controllers/goals.server.controller');

module.exports = function(app) {
  // Goals Routes
  app.route('/goals')
      .get(goals.list)
      .post(users.requiresLogin, goals.create);

  app.route('/goals/approved')
    .get(users.requiresLogin, goals.approved);

  app.route('/goals/:goalId')
      .get(goals.read)
      .put(users.requiresLogin, goals.hasAuthorization, goals.update)
      .delete(users.requiresLogin, goals.hasAuthorization, goals.delete);

  app.route('/goals/:goalId/teacher')
      .put(users.requiresLogin, users.isTeacher, goals.updateByTeacher);


  // Finish by binding the goal middleware
  app.param('goalId', goals.goalByID);
};