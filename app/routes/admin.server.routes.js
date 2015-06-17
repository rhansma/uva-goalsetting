/**
 * Created by Robin on 17-6-2015.
 */
'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller');

module.exports = function(app) {
  // Admin Routes
  app.route('/admin/users')
      .get(users.requiresLogin, users.isTeacher, users.list);

  app.route('/admin/teachers')
      .get(users.requiresLogin, users.isTeacher, users.listTeachers);
};