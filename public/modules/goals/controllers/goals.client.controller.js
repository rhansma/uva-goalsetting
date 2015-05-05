'use strict';

angular.module('goals').controller('GoalsController', ['$scope', 'Goals', 'Authentication', '$location', '$stateParams',
	function($scope, Goals, Authentication, $location, $stateParams) {
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

    $scope.find = function() {
      $scope.goals = Goals.query();
    };

    $scope.findOne = function() {
      $scope.goal = Goals.get({
        goalId: $stateParams.goalId
      });
    };
	}
]);