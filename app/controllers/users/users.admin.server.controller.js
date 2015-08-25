'use strict';

/**
 * Created by Robin on 17-6-2015.
 */

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    errorHandler = require('../errors.server.controller.js'),
    mongoose = require('mongoose'),
    path = require('path'),
    Mail = require('../mail.server.controller.js'),
    emailTemplates = require('swig-email-templates'),
    User = mongoose.model('User');

/**
 * List all users
 * @param req
 * @param res
 */
exports.list = function(req, res) {
  User.find().exec(function(err, users) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(users);
    }
  });
};

/**
 * List all teachers
 * @param req
 * @param res
 */
exports.listTeachers = function(req, res) {
  User.find({roles: {$elemMatch:{$in: ['teacher']}}}).exec(function(err, teachers) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(teachers);
    }
  });
};

/**
 * List all users who dont have the role teacher
 * @param req
 * @param res
 */
exports.listNotTeachers = function(req, res) {
  User.find({roles: {$elemMatch:{$nin: ['teacher']}}}, 'email').exec(function(err, teachers) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(teachers);
    }
  });
};

function _addUser(email, res) {
  var user = new User();
  user.email = email;
  user.provider = 'AdminCreated';

  user.save(function(err) {
    if(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      emailTemplates({
        root: path.join(__dirname, '../../views/templates')
      }, function(err, render) {
        var context = {
          APP_URL: process.env.APP_URL
        };
        render('invite-email.html', context, function(err, html) {
          Mail.mail(email, 'Start setting goals', html);
          res.json(user);
        });
      });
    }
  });
}

/**
 * Add a new user for login with surfconext
 * @param req
 * @param res
 */
exports.addUser = function(req, res) {
  _addUser(req.body.email, res);
};

/**
 * Add users in batch
 * @param req
 * @param res
 */
exports.addUserBatch = function(req, res) {
  var emails = req.body.emails.split(';');

  for(var i = 0; i < emails.length; i++) {
    _addUser(emails[i]);
  }

  res.send(200);
};

/**
 * Delete the user
 * @param req
 * @param res
 */
exports.deleteUser = function(req, res) {
  User.remove({'_id': req.params.userId}, function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.status(200).send();
    }
  });
};

/**
 * Delete teacher role from user
 * @param req
 * @param res
 */
exports.deleteTeacher = function(req, res) {
  User.findById(req.params.userId).exec(function(err, user) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      user.roles = ['student'];
      user.save(function (err) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.json(user);
        }
      });
    }
  });
};