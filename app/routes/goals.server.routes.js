'use strict';

/**
 * Created by:    Robin Hansma (robin@ihatestatistics.com)
 * Date:          5-5-2015
 */

/**
 * Module dependencies.
 */
var pmx = require('pmx');
var users = require('../../app/controllers/users.server.controller'),
    goals = require('../../app/controllers/goals.server.controller');

module.exports = function(app) {
  // Goals Routes
  app.route('/goals')
      .get(users.requiresLogin, users.isTeacher, goals.list)
      .post(users.requiresLogin, goals.create);

  app.route('/goals/approved')
      .get(users.requiresLogin, goals.approved);

  app.route('/goals/:goalId')
      .get(goals.read)
      .put(users.requiresLogin, goals.hasAuthorization, goals.update)
      .delete(users.requiresLogin, goals.hasAuthorization, goals.delete);

  app.route('/goals/teacher/publish')
      .put(users.requiresLogin, users.isTeacher, goals.publish);

  app.route('/goals/teacher/:goalId')
      .put(users.requiresLogin, users.isTeacher, goals.updateByTeacher);


  // Finish by binding the goal middleware
  app.param('goalId', goals.goalByID);

  app.use(pmx.expressErrorHandler());
};