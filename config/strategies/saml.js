'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	SamlStrategy = require('passport-saml').Strategy,
  fs = require('fs'),
	User = require('mongoose').model('User'),
  pvk = fs.readFileSync('./config/keys/mykey.key', 'utf-8');

// Set in global scope, so it can be used again for the metadata route
global.SAMLStrategy = new SamlStrategy({
      path: '/login/callback',
      entryPoint: 'https://engine.surfconext.nl/authentication/idp/single-sign-on',
      issuer: 'goalsetting.ihatestatistics.com',
      identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
      callbackUrl: 'https://goalsetting.ihatestatistics.com/login/callback',
      acceptedClockSkewMs: -1
    },
    function(profile, done) {
      User.findOne({email: profile.email}).exec(function (err, user) {
        if (err) {
          return done(err);
        } else {
          if (user) {
            return done(null, user);
          }

          var newUser = new User();
          newUser.firstName = profile['urn:mace:dir:attribute-def:givenName'];
          newUser.lastName = profile['urn:mace:dir:attribute-def:sn'];
          newUser.diplayName = profile['urn:mace:dir:attribute-def:givenName'] + ' ' + profile['urn:mace:dir:attribute-def:sn'];
          newUser.email = profile['urn:mace:dir:attribute-def:mail'];
          newUser.provider = 'SurfConext';
          newUser.roles = [];
          newUser.roles.push(profile['urn:mace:dir:attribute-def:eduPersonAffiliation']);
          newUser.save(function (err) {
            if (err) {
              return done(err);
            }
            return done(null, newUser);
          });
        }
      });
    }
);

module.exports = function() {
  var samlStrategy = global.SAMLStrategy;

  // Use SAML strategy for Surfconext
  passport.use(samlStrategy);
};