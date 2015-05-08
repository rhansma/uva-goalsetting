'use strict';

angular.module('goals').controller('GoalsController', ['$scope', 'Goals', 'Authentication', '$location', '$stateParams',
    '$filter',
	function($scope, Goals, Authentication, $location, $stateParams, $filter) {
    $scope.authentication = Authentication;

    $scope.create = function() {
      var goal = new Goals({
        title: this.title,
        content: this.content,
        expires: this.expires
      });
      goal.$save(function(response) {
        $location.path('goals/' + response._id);

        $scope.title = '';
        $scope.content = '';
        $scope.expires = '';
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
      });
    };

    $scope.$watch('goal.expires', function() {
      if($scope.goal !== undefined) {
        $scope.goal.expires = moment($scope.goal.expires).format('YYYY-MM-DD');
      }
    });
	}
]);