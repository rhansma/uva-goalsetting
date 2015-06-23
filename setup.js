/**
 * Created by Robin on 23-6-2015.
 */

'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
    config = require('./config/config'),
    mongoose = require('mongoose'),
    chalk = require('chalk'),
    User = require('./app/models/user.server.model.js'),
    User = mongoose.model('User');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Bootstrap db connection
var db = mongoose.connect(config.db, function(err) {
  if (err) {
    console.error(chalk.red('Could not connect to MongoDB!'));
    console.log(chalk.red(err));
  }
});

var make_passwd = function(n, a) {
  var index = (Math.random() * (a.length - 1)).toFixed(0);
  return n > 0 ? a[index] + make_passwd(n - 1, a) : '';
};

var password = make_passwd(13, 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890');
var user = new User;
user.displayName = 'Admin';
user.email = 'uva@goalsetting.com';
user.password = password;
user.roles = ['teacher'];
user.provider = 'InitialAdmin';

user.save(function(err) {
  if(err) {
    console.log('Error creating inital admin user');
    console.log(err);
  } else {
    console.log('Admin user created');
    console.log('Email: uva@goalsetting.com');
    console.log('Password: ' + password);
  }
});

