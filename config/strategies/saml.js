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
      issuer: 'https://engine.surfconext.nl/authentication/idp/metadata'
    },
    function(profile, done) {
      User.findOne({
        studentNumber: profile.studentNumber
      }, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, {
            message: 'Unknown user or invalid password'
          });
        }
        if (!user.authenticate(profile.password)) {
          return done(null, false, {
            message: 'Unknown user or invalid password'
          });
        }

        return done(null, user);
      });
    })
  );
};