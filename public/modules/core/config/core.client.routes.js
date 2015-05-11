'use strict';

// Setting up route

//Fix this
angular.module('core').constant('AUTH_LEVEL', {
  'public': 7, //111
  'student': 6, //110
  'teacher': 4 //100
});

angular.module('core').config(['$stateProvider', '$urlRouterProvider', 'AUTH_LEVEL',
	function($stateProvider, $urlRouterProvider, AUTH_LEVEL) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html',
      accessLevel: AUTH_LEVEL.public
		});
	}
]);