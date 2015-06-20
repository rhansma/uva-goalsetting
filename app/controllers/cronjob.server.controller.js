'use strict';

/**
 * Created by:    Robin Hansma (robin@ihatestatistics.com)
 * Date:          5-6-2015
 */

var mongoose = require('mongoose'),
    Goal = mongoose.model('Goal'),
    UserGoals = mongoose.model('UserGoals'),
    User = mongoose.model('User'),
    CronJob = require('cron').CronJob,
    Mail = require('./mail.server.controller.js'),
    errorHandler = require('./errors.server.controller.js'),
    _ = require('lodash');

/* Cronjob for sending reminder mails */
new CronJob('0 0 * * * *', function() {
  var date = new Date();
  date.setHours(date.getHours() + process.env.REMINDER_TIME);

  errorHandler.log('Checking for goals about to expire', 'info');

  /* Get goals with expiry date less than reminder time */
  Goal.find({'expires': {$lte: date}}, '_id').exec(function(err, goals) {
    if(err) {
      errorHandler.log(err);
    } else {
      /* Get all user goals which are not reminded yet */
      UserGoals.find({'goal': {$in: goals}, 'reminded': {$exists: false}}).populate('user').exec(function(err, userGoals) {
        if(err) {
          errorHandler.log(err);
        } else {
          var body = '<html><body><h1>Your goal is about to expire!</h1><p>One of the goals you committed to is about to expire, ' +
            'please check out your goal before it is too late. Follow this <a href="' + process.env.APP_URL +
            '">link</a> (' + process.env.APP_URL + ') to view your goals.</p></body></html>';

          var users = [];
          /* Send mail and update reminded date */
          _.each(userGoals, function(userGoal, index, list) {
            /* Send mails once */
            if(users.indexOf(userGoal.user.email) === -1) {
              users.push(userGoal.user.email);
              Mail.mail(userGoal.user.email, 'Your goal is about to expire!', body);
            }

            /* If this is the last goal, update all of them */
            if(index === (_.size(list) - 1)) {
              UserGoals.update({'goal': {$in: goals}}, {$set: {reminded: new Date()}}, {multi: true}).exec(function(err) {
                if(err) {
                  errorHandler.log(err);
                }
              });
            }
          });
        }
      });
    }
  });
}, null, true, 'Europe/Amsterdam');

/* Cronjob for setting goals expired */
new CronJob('0 20 * * * *', function() {
  var date = new Date();

  errorHandler.log('Checking for expired goals', 'info');
  Goal.find({'expires': {$lte: date}}, '_id').exec(function(err, goals) {
    if (err) {
      errorHandler.log(err);
    } else {
      UserGoals.update({'goal': {$in: goals},'status': {$nin: ['finished', 'aborted', 'expired']}}, {$set: {status: 'expired'}}, {multi: true}).exec(function (err, num) {
        if (err) {
          errorHandler.log(err);
        } else {
          errorHandler.log(num + ' goals are expired', 'info');
        }
      });
    }
  });
}, null, true, 'Europe/Amsterdam');