'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	UsersGoals = mongoose.model('UserGoals'),
  Goal = mongoose.model('Goal');

/**
 * Globals
 */
var user, usersGoals, goal;

/**
 * Unit tests
 */
describe('Users goals Model Unit Tests:', function() {
	beforeEach(function(done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      studentNumber: 123456789,
      username: 'username',
      password: 'password'
    });

		user.save(function() {
      goal = new Goal({
        title: 'Test',
        content: 'This is a goal',
        creator: user,
        expires: Date.now(),
        rating: 9
      }).save(function() {
          usersGoals = new UsersGoals({
            user: user,
            goal: goal,
            status: 'committed'
          });

          done();
      });
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return usersGoals.save(function(err) {
				should.not.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) { 
		UsersGoals.remove().exec();
		User.remove().exec();

		done();
	});
});