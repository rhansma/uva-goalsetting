'use strict';

/**
 * Created by:    Robin Hansma (robin@ihatestatistics.com)
 * Date:          28-5-2015
 */

var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Mail = mongoose.model('Mail'),
  _ = require('lodash'),
  nodemailer = require('nodemailer'),
  errorHandler = require('./errors.server.controller.js'),
  smtpTransport = require('nodemailer-smtp-transport');

var transport = nodemailer.createTransport(smtpTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
}));

/**
 * Mail function
 * @param to
 * @param subject
 * @param body
 * @private
 */
function _mail(to, subject, body) {
  transport.sendMail({
    from: process.env.MAIL_FROM,
    to: to,
    subject: subject,
    html: body
  }, function(error, info){
    if(error){
      return errorHandler.log(error);
    }
    errorHandler.log('Message sent: ' + info.response);

  });
}

/**
 * Send mail to single person
 * @param to
 * @param subject
 * @param body
 */
exports.mail = function(to, subject, body) {
  _mail(to, subject, body);
};

/**
 * Mail to all users
 * @param subject
 * @param body
 */
exports.mailToAll = function(subject, body) {
  var time = new Date();
  time.setMinutes(time.getMinutes() - 5);


  /* Log mails in database */
  var mailRecord = new Mail({toAll: true, subject: subject, body: body});
  mailRecord.save(function(err) {
    if (err) throw err;
    else {
      User.find().exec(function(err, users) {
        if (!err) {
          _.each(users, function(user) {
            _mail(user.email, subject, body);
          });
        }
      });
    }
  });
};