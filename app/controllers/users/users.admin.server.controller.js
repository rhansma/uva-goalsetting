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
    User = mongoose.model('User');

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

exports.addUser = function(req, res) {
  var user = new User();
  user.email = req.body.email;
  user.provider = 'AdminCreated';

  user.save(function(err) {
    if(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(user);
    }
  });
};

exports.deleteUser = function(req, res) {
  User.remove({'_id': req.params.userId}, function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.status(200).send();
    }
  })
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