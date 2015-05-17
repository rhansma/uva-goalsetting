'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	UserGoalGroups = mongoose.model('UserGoalGroups'),
  Goal = mongoose.model('Goal'),
  UsersGoals = mongoose.model('UserGoals');

/**
 * Globals
 */
var user, userGoalGroups, goal1, goal2, userGoals1, userGoals2;

/**
 * Unit tests
 */
describe('User goal groups Model Unit Tests:', function() {
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
      goal1 = new Goal({
        title: 'Test',
        content: 'This is a goal',
        creator: user,
        expires: Date.now(),
        rating: 9
      }).save(function(err, goal) {
          goal1 = goal;
          goal2 = new Goal({
            title: 'Test2',
            content: 'This is a goal',
            creator: user,
            expires: Date.now(),
            rating: 7
          }).save(function(err, goal) {
              goal2 = goal;
              userGoals1 = new UsersGoals({
                user: user,
                goal: goal1,
                status: 'committed'
              }).save(function() {
                  userGoals2 = new UsersGoals({
                    user: user,
                    goal: goal2,
                    status: 'committed'
                  }).save(function () {
                      userGoalGroups = new UserGoalGroups({
                        user: user,
                        parent: goal1,
                        children: [goal2]
                      });
                      done();
                  });
              });
            });
        });
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return userGoalGroups.save(function(err) {
				should.not.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) { 
		UserGoalGroups.remove().exec();
		User.remove().exec();

		done();
	});
});