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
      //decryptionPvk: pvk,
      //cert: 'MIID3zCCAsegAwIBAgIJAMVC9xn1ZfsuMA0GCSqGSIb3DQEBCwUAMIGFMQswCQYDVQQGEwJOTDEQMA4GA1UECAwHVXRyZWNodDEQMA4GA1UEBwwHVXRyZWNodDEVMBMGA1UECgwMU1VSRm5ldCBCLlYuMRMwEQYDVQQLDApTVVJGY29uZXh0MSYwJAYDVQQDDB1lbmdpbmUuc3VyZmNvbmV4dC5ubCAyMDE0MDUwNTAeFw0xNDA1MDUxNDIyMzVaFw0xOTA1MDUxNDIyMzVaMIGFMQswCQYDVQQGEwJOTDEQMA4GA1UECAwHVXRyZWNodDEQMA4GA1UEBwwHVXRyZWNodDEVMBMGA1UECgwMU1VSRm5ldCBCLlYuMRMwEQYDVQQLDApTVVJGY29uZXh0MSYwJAYDVQQDDB1lbmdpbmUuc3VyZmNvbmV4dC5ubCAyMDE0MDUwNTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKthMDbB0jKHefPzmRu9t2h7iLP4wAXr42bHpjzTEk6gttHFb4l/hFiz1YBI88TjiH6hVjnozo/YHA2c51us+Y7g0XoS7653lbUN/EHzvDMuyis4Xi2Ijf1A/OUQfH1iFUWttIgtWK9+fatXoGUS6tirQvrzVh6ZstEp1xbpo1SF6UoVl+fh7tM81qz+Crr/Kroan0UjpZOFTwxPoK6fdLgMAieKSCRmBGpbJHbQ2xxbdykBBrBbdfzIX4CDepfjE9h/40ldw5jRn3e392jrS6htk23N9BWWrpBT5QCk0kH3h/6F1Dm6TkyG9CDtt73/anuRkvXbeygI4wml9bL3rE8CAwEAAaNQME4wHQYDVR0OBBYEFD+Ac7akFxaMhBQAjVfvgGfY8hNKMB8GA1UdIwQYMBaAFD+Ac7akFxaMhBQAjVfvgGfY8hNKMAwGA1UdEwQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAC8L9D67CxIhGo5aGVu63WqRHBNOdo/FAGI7LURDFeRmG5nRw/VXzJLGJksh4FSkx7aPrxNWF1uFiDZ80EuYQuIv7bDLblK31ZEbdg1R9LgiZCdYSr464I7yXQY9o6FiNtSKZkQO8EsscJPPy/Zp4uHAnADWACkOUHiCbcKiUUFu66dX0Wr/v53Gekz487GgVRs8HEeT9MU1reBKRgdENR8PNg4rbQfLc3YQKLWK7yWnn/RenjDpuCiePj8N8/80tGgrNgK/6fzM3zI18sSywnXLswxqDb/J+jgVxnQ6MrsTf1urM8MnfcxG/82oHIwfMh/sXPCZpo+DTLkhQxctJ3M=',
      identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
      callbackUrl: 'https://goalsetting.ihatestatistics.com/login/callback',
      acceptedClockSkewMs: -1
    },
    function(profile, done) {
      User.find({email: profile.email}).exec(function (err, user) {
        if (err) {
          return done(err);
        } else {
          if (user) {
            return done(null, user);
          }

          var newUser = new User();
          newUser.firstName = profile['urn:mace:dir:attribute-def:givenName'];
          newUser.lastName = profile['urn:mace:dir:attribute-def:sn'];
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