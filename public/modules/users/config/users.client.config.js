'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								$location.path('unauthorized');
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);

angular.module('users').constant('AUTH_LEVEL', [{
  'public': 7, //111
  'student': 6, //110
  'teacher': 4 //100
}]);

