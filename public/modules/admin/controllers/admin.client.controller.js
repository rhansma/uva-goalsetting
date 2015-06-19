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
      $scope.usernames = [];

      angular.forEach($scope.users, function(value) {
        console.log(value);
        $scope.usernames.push(value.displayName);
      });
    };

    $scope.addUser = function() {
      $scope.users.push({});
    }
	}
]);