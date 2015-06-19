'use strict';

angular.module('admin').controller('AdminController', ['$scope', 'Admin', 'notify',
	function($scope, Admin, notify) {
    $scope.activeTab = 'addTeachers';

    $scope.openTab = function(tab) {
      $scope.activeTab = tab;
    };

    $scope.findTeachers = function() {
      $scope.teachers = Admin.getTeachers();
    };

    $scope.findNotTeachers = function() {
      $scope.notTeachers = Admin.getNotTeachers();
    };

    $scope.findUsers = function() {
      $scope.users = Admin.getUsers();
    };

    $scope.addUser = function() {
      var user = new Admin({
        email: this.email
      });

      user.$addUser(function() {
        notify({message: 'Changes saved!', classes: 'alert', templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
        $scope.spinner = false;
      }, function(errorResponse) {
        $scope.spinner = false;
        $scope.error = errorResponse.data.message;
      });
    };

    /**
     * Add teacher role to user
     * @param user
     */
    $scope.addTeacher = function(user) {
      $scope.spinner = true;

      Admin.addTeacherRole({userId: user._id}, function () {
        notify({message: 'Changes saved!', classes: 'alert', templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
        $scope.spinner = false;

        $scope.teachers = Admin.getTeachers();
        $scope.notTeachers = Admin.getNotTeachers();
      }, function(errorResponse) {
        $scope.spinner = false;
        $scope.error = errorResponse.data.message;
      });
    };
	}
]);