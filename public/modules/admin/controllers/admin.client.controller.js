'use strict';

angular.module('admin').controller('AdminController', ['$scope', 'Admin',
	function($scope, Admin) {
    $scope.activeTab = 'addTeachers';

    $scope.openTab = function(tab) {
      $scope.activeTab = tab;
    };

    $scope.findTeachers = function() {
      $scope.teachers = Admin.getTeachers();
    };

    $scope.findUsers = function() {
      $scope.users = Admin.getUsers();
    };
	}
]);