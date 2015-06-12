'use strict';

angular.module('goals').controller('GoalsController', ['$scope', 'Goals', 'Authentication', '$location', '$stateParams', 'moment', 'notify',
	function($scope, Goals, Authentication, $location, $stateParams, moment, notify) {
    $scope.authentication = Authentication._data;
    $scope.teacher = Authentication.isTeacher();

    $scope.create = function() {
      $scope.spinner = true;

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
        $scope.spinner = false;
      }, function(errorResponse) {
        $scope.spinner = false;
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

        for(var i in $scope.goal.subgoals) {
          $scope.goal.subgoals[i].expires = new Date(moment($scope.goal.subgoals[i].expires).format('YYYY-MM-DD'));
        }
      });
    };

    /* Save teacher edits */
    $scope.save = function() {
      var successes = 0;
      /* Loop through all goals and update them */
      angular.forEach($scope.goals, function(goal) {
        goal.$teacherUpdate(function() {
          successes++;

          /* Show message if all changes are saved */
          if(successes === $scope.goals.length) {
            notify({message: 'Changes saved!', classes: 'alert', templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
          }
        }, function(errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      });
    };

    /* Publish all rated goals */
    $scope.publish = function() {
      Goals.publish(function() {
        notify({message: 'All rated goals are published, students can now commit or reject to them.', classes: 'alert', templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    /* Add a empty subgoal */
    $scope.addSubgoal = function() {
      this.goal.subgoals.push({});
    };
	}
]);

/* Directive for checking if specified date is in future */
angular.module('goals')
  .directive('dateInFuture', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attr, ctrl) {
        ctrl.$parsers.unshift(function(value) {
          var valid;

          if(value) {
            valid = new Date() < new Date(value);
            ctrl.$setValidity('dateInPast', valid);
          }

          return valid ? value : undefined;
        });
      }
    };
  });