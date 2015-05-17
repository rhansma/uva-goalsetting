'use strict';

angular.module('goals').controller('UserGoalsController', ['$scope', 'UserGoals', 'Goals', 'UserGoalGroups', '$state', 'notify', '$stateParams',
	function($scope, UserGoals, Goals, UserGoalGroups, $state, notify, $stateParams) {
    /* Find committed goals */
    $scope.find = function() {
      $scope.userGoals = UserGoals.query();
    };

    /* Find approved but not committed or rejected goals */
    $scope.findApproved = function() {
      $scope.goals = Goals.getApproved();
    };

    /* Find grouped goals */
    $scope.findGrouped = function() {
      $scope.userGoals = UserGoalGroups.get({
        userGoalGroupId: $stateParams.userGoalGroupId
      });
    };

    /* Find one user goal */
    $scope.findOne = function() {
      $scope.userGoal = UserGoals.get({
        userGoalId: $stateParams.userGoalId
      });
    };

    /* Save user goal status */
    $scope._saveUserGoal = function(goal, status) {
      var userGoal = new UserGoals({
        status: status,
        goal: goal
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

    /* Drag-and-drop functionality for groupping goals */
    $scope.onDropComplete = function(source, target){
      /* Create a new userGoalGroup */
      if($scope.userGoals[target].group === undefined) {
        var userGoalGroup = new UserGoalGroups({
          parent: $scope.userGoals[target]._id,
          children: [$scope.userGoals[source]._id]
        });

        userGoalGroup.$save(function() {
          $state.reload();
        }, function(errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      } else { /* Or update existing */
        /* Dont group already grouped goals */
        if($scope.userGoals[source].group !== undefined) {
          notify({message: 'It is not possible to group already grouped goals.', classes: 'alert', templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
        } else {
          var userGoalGroup = new UserGoalGroups({
            _id: $scope.userGoals[target].group,
            child: $scope.userGoals[source]._id
          });

          userGoalGroup.$update(function() {
            $state.reload();
          }, function(errorResponse) {
            $scope.error = errorResponse.data.message;
          });
        }
      }
    };

    /* Save goal with new state */
    $scope.save = function() {
      var goal = new UserGoals($scope.userGoal);

      goal.$update(function() {
        notify({message: 'Succesfully saved', templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
      }, function(errorResponse) {
        notify({message: errorResponse.data.message, templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
      });
    };
	}
]);

/* Filter for conditionally showing a plus only if not empty */
angular.module('goals').filter('addPlus', function() {
  return function(input) {
    return((input === undefined) | (input === 0))? '' : '+' + input;
  }
});