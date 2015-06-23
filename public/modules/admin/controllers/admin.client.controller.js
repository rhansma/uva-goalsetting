'use strict';

angular.module('admin').controller('AdminController', ['$scope', 'Admin', 'notify', 'ngDialog',
	function($scope, Admin, notify, ngDialog) {
    $scope.activeTab = 'addTeachers';

    /**
     * Switch from tabs (user/teacher)
     * @param tab
     */
    $scope.openTab = function(tab) {
      $scope.activeTab = tab;
    };

    /**
     * Find functions
     */
    $scope.findTeachers = function() {
      $scope.teachers = Admin.getTeachers();
    };

    $scope.findNotTeachers = function() {
      $scope.notTeachers = Admin.getNotTeachers();
    };

    $scope.findUsers = function() {
      $scope.users = Admin.getUsers();
    };

    /**
     * Add new user
     */
    $scope.addUser = function() {
      var user = new Admin({
        email: this.email
      });

      user.$addUser(function() {
        notify({message: 'Changes saved!', classes: 'alert', templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
        $scope.spinner = false;
        $scope.users = Admin.getUsers();

        delete $scope.error;
        $scope.email = null;
        angular.element('input[type=email]').val('');
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

        delete $scope.error;
      }, function(errorResponse) {
        $scope.spinner = false;
        $scope.error = errorResponse.data.message;
      });
    };

    /**
     * Delete a user
     * @param user
     */
    $scope.deleteUser = function(user) {
      /* Show dialog to confirm deletion */
      var dialog = ngDialog.openConfirm({
        template: '<p>Are you sure you want to delete this user?</p>' +
        '<div class="ngdialog-buttons">' +
        '<button type="button" class="ngdialog-button ngdialog-button-secondary primary" ng-click="closeThisDialog(0)">No</button>' +
        '<button type="button" class="ngdialog-button ngdialog-button-primary alert" ng-click="confirm(true)">Yes</button>' +
        '</div>',
        plain: true
      });
      dialog.then(function(data) {
        if (data) {
          Admin.deleteUser({'userId': user._id}, function() {
            notify({message: 'Changes saved!', classes: 'alert', templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
            $scope.spinner = false;
            delete $scope.error;

            $scope.users = Admin.getUsers();
          }, function(errorResponse) {
            $scope.spinner = false;
            $scope.error = errorResponse.data.message;
          });
        }
      });
    };

    /**
     * Remove teacher role from user
     * @param teacher
     */
    $scope.deleteTeacher = function(teacher) {
      $scope.spinner = true;

      /* Show dialog to confirm deletion */
      var dialog = ngDialog.openConfirm({
        template: '<p>Are you sure you want to delete this teacher?</p>' +
        '<div class="ngdialog-buttons">' +
        '<button type="button" class="ngdialog-button ngdialog-button-secondary primary" ng-click="closeThisDialog(0)">No</button>' +
        '<button type="button" class="ngdialog-button ngdialog-button-primary alert" ng-click="confirm(true)">Yes</button>' +
        '</div>',
        plain: true
      });
      dialog.then(function(data) {
        if (data) {
          Admin.deleteTeacher({'userId': teacher._id}, function() {
            notify({message: 'Changes saved!', classes: 'alert', templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
            $scope.spinner = false;
            delete $scope.error;

            $scope.teachers = Admin.getTeachers();
            $scope.notTeachers = Admin.getNotTeachers();
          }, function(errorResponse) {
            $scope.spinner = false;
            $scope.error = errorResponse.data.message;
          });
        }
      });
    };
	}
]);