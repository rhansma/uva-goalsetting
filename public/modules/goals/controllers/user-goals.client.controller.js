'use strict';

angular.module('goals').controller('UserGoalsController', ['$scope', 'UserGoals', 'Goals', 'UserGoalGroups', '$state', 'notify', '$stateParams', 'moment',
	function($scope, UserGoals, Goals, UserGoalGroups, $state, notify, $stateParams, moment) {
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
      }, function() {
        for(var i in $scope.userGoal.subgoals) {
          $scope.userGoal.subgoals[i].expires = new Date(moment($scope.userGoal.subgoals[i].expires).format('YYYY-MM-DD'));
        }
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

    $scope.abort = function() {
      var userGoal = $scope.userGoal;

      userGoal.$abort(function() {
        notify({message: 'You\'ve aborted this goal', classes: 'alert', templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    /* Drag-and-drop functionality for grouping goals */
    $scope.onDropComplete = function(source, target){
      var userGoalGroup;
      /* Create a new userGoalGroup */
      if($scope.userGoals[target].group === undefined && $scope.userGoals[source].group === undefined) {
        userGoalGroup = new UserGoalGroups({
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
          notify({message: 'It is not possible to group already grouped goals. Drag a non grouped goal to a group for grouping more than two goals.', classes: 'alert', templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
        } else {
          userGoalGroup = new UserGoalGroups({
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
      /* Do nothing if goal is aborted */
      if($scope.userGoal.status === 'aborted') {
        return false;
      }

      var goal = $scope.userGoal;//new UserGoals();

      goal.$update(function() {
        notify({message: 'Succesfully saved', templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
      }, function(errorResponse) {
        notify({message: errorResponse.data.message, templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
      });
    };

    /* Retrieve statistics for chart */
    $scope.getStatistics = function() {
      $scope.labels = [];
      $scope.data = [[]];
      $scope.series = ['Completed goals'];
      $scope.options = {
        scaleBeginAtZero: true
      };

      /* Get statistics on goals */
      $scope.statistics = UserGoals.getStatistics(function(){
        $scope.statistics.completed = 0;

        angular.forEach($scope.statistics.finished, function(elem) {
          $scope.statistics.completed += elem.total;

          var date = elem._id;
          $scope.labels.push(moment(new Date(date.year, date.month - 1, date.day)).format('MMM Do')); // Subtract one month because months are from 0-11 instead of 1-12
          $scope.data[0].push($scope.statistics.completed);
        });
      });
    };

    $scope.addSubgoal = function() {
      $scope.userGoal.subgoals.push({});
    };
  }
]);

/* Filter for conditionally showing a plus only if not empty */
angular.module('goals').filter('addPlus', function() {
  return function(input) {
    return((input === undefined) | (input === 0))? '' : '+' + input;
  };
});