'use strict';

// Setting up route

//Fix this
angular.module('core').constant('AUTH_LEVEL', {
  'public': 0,
  'student': 1,
  'teacher': 2
});

angular.module('core').config(['$stateProvider', '$urlRouterProvider', 'AUTH_LEVEL',
	function($stateProvider, $urlRouterProvider, AUTH_LEVEL) {
		// Redirect to signin view when route not found
		$urlRouterProvider.otherwise('/signin');
	}
]);