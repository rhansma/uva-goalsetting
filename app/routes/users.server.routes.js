'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
    fs = require('fs'),
    SamlStrategy = require('passport-saml').Strategy;

module.exports = function(app) {
	// User Routes
	var users = require('../../app/controllers/users.server.controller');

	// Setting up the users profile api
	app.route('/users/me').get(users.me);
	app.route('/users').put(users.update);
	app.route('/users/accounts').delete(users.removeOAuthProvider);

	// Setting up the users password api
	app.route('/users/password').post(users.changePassword);
	app.route('/auth/forgot').post(users.forgot);
	app.route('/auth/reset/:token').get(users.validateResetToken);
	app.route('/auth/reset/:token').post(users.reset);

	// Setting up the users authentication api
	app.route('/auth/signup').post(users.signup);
	app.route('/auth/signin').post(users.signin);
	app.route('/auth/signout').get(users.signout);
  app.route('/auth/authenticated').get(users.authenticated);

	// Finish by binding the user middleware
	app.param('userId', users.userByID);

  // Setting the SAML routes, for Surfconext
  app.route('/login/callback').post(passport.authenticate('saml'),
      function(req, res) {
        res.redirect('/#!/goals');
      });

  app.route('/login').get(passport.authenticate('saml', { failureRedirect: '/login', failureFlash: true }),
      function(req, res) {
        res.redirect('/');
      }
  );

  // Route for sending metadata for Surfconext
  app.route('/metadata').get(function(req, res) {
    var saml = fs.readFileSync('./config/strategies/saml.xml', 'utf-8');

    res.type('application/xml');
    res.status(200).send(saml);
  });

  // Route for adding teacher role to teacher for testing purposes
  // ToDo: Remove after testing
  app.route('/user/teacher/add/:user').get(users.addTeacherRole);
};