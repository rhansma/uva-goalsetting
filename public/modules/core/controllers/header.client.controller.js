'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus', '$rootScope',
	function($scope, Authentication, Menus, $rootScope) {
	  $scope.checkAuthenticated = function() {
      /* Check if user is authenticated for showing or hiding the menu */
      Authentication.isLoggedIn().then(function(data) {
        $scope.user = Authentication._data.user;
        $scope.authenticated = data;
      });
    };

    $scope.user = Authentication._data.user;

		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});

    $rootScope.$on(Authentication.AUTH_EVENTS.reloadMenu, $scope.checkAuthenticated);
    $scope.checkAuthenticated();
	}
]);