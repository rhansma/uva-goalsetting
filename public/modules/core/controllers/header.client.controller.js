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
		$scope.menu = Menus.getMenu('topbar');

    /* Close menu after a click */
    angular.element(document).on("click", ".top-bar li", function () {
      var li = angular.element(this);
      if(!li.hasClass('toggle-topbar') && !li.hasClass('has-dropdown') && !li.hasClass('back')) {
        Foundation.libs.topbar.toggle(angular.element('.top-bar'));
      }
    });

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});

    $rootScope.$on(Authentication.AUTH_EVENTS.reloadMenu, $scope.checkAuthenticated);
    $scope.checkAuthenticated();
	}
]);