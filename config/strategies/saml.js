'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	SamlStrategy = require('passport-saml').Strategy,
	User = require('mongoose').model('User');

module.exports = function() {
  // Use SAML strategy for Surfconext
  passport.use(new SamlStrategy({
      path: '/login/callback',
      entryPoint: 'https://engine.surfconext.nl/authentication/idp/single-sign-on',
      issuer: 'passport-saml'
    },
    function(profile, done) {
      User.findByStudentNumber(profile.studentNumber, function(err, user) {
        if (err) {
          return done(err);
        }
        return done(null, user);
      });
    })
  );
};