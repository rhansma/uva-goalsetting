'use strict';

angular.module('admin').constant('AUTH_LEVEL', {
  'public': 0,
  'student': 1,
  'teacher': 2
});

//Setting up route
angular.module('admin').config(['$stateProvider', 'AUTH_LEVEL',
	function($stateProvider, AUTH_LEVEL) {
		// Admin state routing
		$stateProvider.
		state('dashboard', {
			url: '/dashboard',
			templateUrl: 'modules/admin/views/dashboard.client.view.html',
      accessLevel: AUTH_LEVEL.public
		});
	}
]);