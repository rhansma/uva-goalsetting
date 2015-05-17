'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Goal = mongoose.model('Goal');

/**
 * Globals
 */
var user, goal;

/**
 * Unit tests
 */
describe('Goal Model Unit Tests:', function() {
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
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return goal.save(function(err) {
				should.not.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) { 
		Goal.remove().exec();
		User.remove().exec();
		
		done();
	});
});