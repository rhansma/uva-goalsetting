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

	// Finish by binding the user middleware
	app.param('userId', users.userByID);

  // Setting the SAML routes, for Surfconext
  app.route('/login/callback').post(passport.authenticate('saml', { failureRedirect: '/login', failureFlash: true }),
      function(req, res) {
        res.redirect('/');
      });

  app.route('/login').get(passport.authenticate('saml', { failureRedirect: '/login', failureFlash: true }),
      function(req, res) {
        res.redirect('/');
      }
  );

  // Route for sending metadata for Surfconext
  app.route('/metadata').get(function(req, res) {
    //ToDo: Fix this! Ugly way of obtaining the desired result
    var cert = fs.readFileSync('./config/certs/certificate.crt', 'utf-8');
    var User = require('mongoose').model('User');
    var pvk = fs.readFileSync('./config/keys/mykey.key', 'utf-8');
    var samlStrategy = new SamlStrategy({
          path: '/login/callback',
          entryPoint: 'https://engine.surfconext.nl/authentication/idp/single-sign-on',
          issuer: 'https://engine.surfconext.nl/authentication/idp/metadata',
          decryptionPvk: pvk,
          cert: 'MIID3zCCAsegAwIBAgIJAMVC9xn1ZfsuMA0GCSqGSIb3DQEBCwUAMIGFMQswCQYDVQQGEwJOTDEQMA4GA1UECAwHVXRyZWNodDEQMA4GA1UEBwwHVXRyZWNodDEVMBMGA1UECgwMU1VSRm5ldCBCLlYuMRMwEQYDVQQLDApTVVJGY29uZXh0MSYwJAYDVQQDDB1lbmdpbmUuc3VyZmNvbmV4dC5ubCAyMDE0MDUwNTAeFw0xNDA1MDUxNDIyMzVaFw0xOTA1MDUxNDIyMzVaMIGFMQswCQYDVQQGEwJOTDEQMA4GA1UECAwHVXRyZWNodDEQMA4GA1UEBwwHVXRyZWNodDEVMBMGA1UECgwMU1VSRm5ldCBCLlYuMRMwEQYDVQQLDApTVVJGY29uZXh0MSYwJAYDVQQDDB1lbmdpbmUuc3VyZmNvbmV4dC5ubCAyMDE0MDUwNTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKthMDbB0jKHefPzmRu9t2h7iLP4wAXr42bHpjzTEk6gttHFb4l/hFiz1YBI88TjiH6hVjnozo/YHA2c51us+Y7g0XoS7653lbUN/EHzvDMuyis4Xi2Ijf1A/OUQfH1iFUWttIgtWK9+fatXoGUS6tirQvrzVh6ZstEp1xbpo1SF6UoVl+fh7tM81qz+Crr/Kroan0UjpZOFTwxPoK6fdLgMAieKSCRmBGpbJHbQ2xxbdykBBrBbdfzIX4CDepfjE9h/40ldw5jRn3e392jrS6htk23N9BWWrpBT5QCk0kH3h/6F1Dm6TkyG9CDtt73/anuRkvXbeygI4wml9bL3rE8CAwEAAaNQME4wHQYDVR0OBBYEFD+Ac7akFxaMhBQAjVfvgGfY8hNKMB8GA1UdIwQYMBaAFD+Ac7akFxaMhBQAjVfvgGfY8hNKMAwGA1UdEwQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAC8L9D67CxIhGo5aGVu63WqRHBNOdo/FAGI7LURDFeRmG5nRw/VXzJLGJksh4FSkx7aPrxNWF1uFiDZ80EuYQuIv7bDLblK31ZEbdg1R9LgiZCdYSr464I7yXQY9o6FiNtSKZkQO8EsscJPPy/Zp4uHAnADWACkOUHiCbcKiUUFu66dX0Wr/v53Gekz487GgVRs8HEeT9MU1reBKRgdENR8PNg4rbQfLc3YQKLWK7yWnn/RenjDpuCiePj8N8/80tGgrNgK/6fzM3zI18sSywnXLswxqDb/J+jgVxnQ6MrsTf1urM8MnfcxG/82oHIwfMh/sXPCZpo+DTLkhQxctJ3M=',
          identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
          callbackUrl: 'https://localhost:3000/login/callback'
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
        });

    res.type('application/xml');
    res.status(200).send(samlStrategy.generateServiceProviderMetadata(cert));
  });
};