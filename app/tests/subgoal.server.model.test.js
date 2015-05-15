'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Subgoal = mongoose.model('Subgoal');

/**
 * Globals
 */
var user, subgoal;

/**
 * Unit tests
 */
describe('Subgoal Model Unit Tests:', function() {
	beforeEach(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password'
		});

		user.save(function() { 
			subgoal = new Subgoal({
				content: 'Test content',
        expires: Date.now(),
        creator: user
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return subgoal.save(function(err) {
				should.not.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) { 
		Subgoal.remove().exec();
		User.remove().exec();

		done();
	});
});