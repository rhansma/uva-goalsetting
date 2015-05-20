'use strict';

angular.module('goals').controller('GoalsController', ['$scope', 'Goals', 'Authentication', '$location', '$stateParams', 'moment',
	function($scope, Goals, Authentication, $location, $stateParams, moment) {
    $scope.authentication = Authentication._data;
    $scope.teacher = Authentication.isTeacher();

    $scope.create = function() {
      var goal = new Goals({
        title: this.title,
        content: this.content,
        expires: this.expires,
        subgoals: this.subgoals
      });

      goal.$save(function(response) {
        $location.path('goals/' + response._id);

        $scope.title = '';
        $scope.content = '';
        $scope.expires = '';
        $scope.subgoals = [];
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    $scope.update = function() {
      var goal = $scope.goal;

      goal.$update(function() {
        $location.path('goals/' + goal._id);
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    $scope.remove = function(goal) {
      if (goal) {
        goal.$remove();

        for (var i in $scope.goals) {
          if ($scope.goals[i] === goal) {
            $scope.goals.splice(i, 1);
          }
        }
      } else {
        $scope.goal.$remove(function() {
          $location.path('goals');
        });
      }
    };

    $scope.find = function() {
      $scope.goals = Goals.query();
    };

    $scope.findOne = function() {
      $scope.goal = Goals.get({
        goalId: $stateParams.goalId
      }, function() {
        /* Rewrite all dates for input[date] */
        $scope.goal.expires = new Date(moment($scope.goal.expires).format('YYYY-MM-DD'));

        for(var i = 0 in $scope.goal.subgoals) {
          $scope.goal.subgoals[i].expires = new Date(moment($scope.goal.subgoals[i].expires).format('YYYY-MM-DD'));
        }
      });
    };

    /* Save teacher edits */
    $scope.save = function() {
      /* Loop through all goals and update them */
      angular.forEach($scope.goals, function(goal) {
        goal.$teacherUpdate(function() {
          $location.path('goals');
        }, function(errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      });
    };

    /* Add a empty subgoal */
    $scope.addSubgoal = function() {
      this.goal.subgoals.push({});
    };
	}
]);