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

  app.route('/admin/user')
      .post(users.requiresLogin, users.isTeacher, users.addUser);

  app.route('/admin/user/batch')
    .post(users.requiresLogin, users.isTeacher, users.addUserBatch);

  app.route('/admin/teacher/:userId')
      .delete(users.requiresLogin, users.isTeacher, users.deleteTeacher);

  app.route('/admin/user/:userId')
    .delete(users.requiresLogin, users.isTeacher, users.deleteUser);

  app.route('/admin/teachers')
      .get(users.requiresLogin, users.isTeacher, users.listTeachers);

  app.route('/admin/not/teachers')
      .get(users.requiresLogin, users.isTeacher, users.listNotTeachers);
};