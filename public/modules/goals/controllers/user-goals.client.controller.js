'use strict';

angular.module('goals').controller('UserGoalsController', ['$scope', 'UserGoals', 'Goals',
	function($scope, UserGoals, Goals) {
    /* Find committed goals */
    $scope.find = function() {
      $scope.userGoals = UserGoals.query();
    };

    /* Find approved but not committed or rejected goals */
    $scope.findApproved = function() {
      $scope.goals = Goals.getApproved();
    };

    /* Save user goal status */
    $scope._saveUserGoal = function(goal, status) {
      var userGoal = new UserGoals({
        status: status,
        goal: goal._id
      });

      userGoal.$save(function(response) {
        $scope.success = response;
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    /* Add goals to the committed or rejected array */
    $scope.reject = function(goal) {
      for (var i in $scope.goals) {
        if ($scope.goals[i] === goal) {
          $scope.goals.splice(i, 1);
        }
      }

      $scope._saveUserGoal(goal, 'rejected');
    };

    $scope.commit = function(goal) {
      for (var i in $scope.goals) {
        if ($scope.goals[i] === goal) {
          $scope.goals.splice(i, 1);
        }
      }

      $scope._saveUserGoal(goal, 'committed');
    };

    $scope.onDropComplete = function(source, target){

    };
	}
]);