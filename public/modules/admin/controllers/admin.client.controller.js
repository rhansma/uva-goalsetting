'use strict';

angular.module('admin').controller('AdminController', ['$scope',
	function($scope) {
    $scope.activeTab = 'addTeachers';

    $scope.openTab = function(tab) {
      $scope.activeTab = tab;
    };

    $scope.findTeachers = function() {

    }

    $scope.findUsers = function() {

    }
	}
]);