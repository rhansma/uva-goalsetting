'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Subgoal = mongoose.model('Subgoal'),
  Goal = mongoose.model('Goal');

/**
 * Globals
 */
var user, subgoal, goal;

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
      }).save(function(err, doc) {
          goal = doc;
          subgoal = new Subgoal({
            content: 'Test content',
            expires: Date.now(),
            creator: user
          });

          done();
      });
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

  describe('Add to goal', function() {
    it('should be able to be added to a goal without problems', function(done) {
      Goal.findByIdAndUpdate(goal, {$push: {subgoals: subgoal}}, function(err) {
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