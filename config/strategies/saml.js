'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	SamlStrategy = require('passport-saml').Strategy,
  fs = require('fs'),
	User = require('mongoose').model('User');

// Set in global scope, so it can be used again for the metadata route
global.SAMLStrategy = new SamlStrategy({
      path: '/login/callback',
      entryPoint: 'https://engine.surfconext.nl/authentication/idp/single-sign-on',
      issuer: 'https://virgo.ic.uva.nl',
      identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
      callbackUrl: 'https://virgo.ic.uva.nl/login/callback',
      acceptedClockSkewMs: -1
    },
    function(profile, done) {
      /* Find user in database */
      User.findOne({email: profile.email}).exec(function (err, user) {
        if (err) {
          return done(err);
        } else {
          if (user) {
            return done(null, user);
          }

          return done(err);
        }
      });
    }
);

module.exports = function() {
  var samlStrategy = global.SAMLStrategy;

  // Use SAML strategy for Surfconext
  passport.use(samlStrategy);
};