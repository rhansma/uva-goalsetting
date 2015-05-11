'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location',
			function($q, $location) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								/*// Deauthenticate the global user
								Authentication.user = null;*/

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

angular.module('users').constant('AUTH_LEVEL', {
  'public': 0,
  'student': 1,
  'teacher': 2
});

angular.module('users').run(['Authentication', '$rootScope', '$location',
  function(Authentication, $rootScope, $location) {
    /* Authorize all requests */
    $rootScope.$on('$stateChangeStart', function(event, next, current) {
      if(!Authentication.authorize(next.accessLevel)) {
        if(Authentication.isLoggedIn()) {
          $location.path('unauthorized');
        } else {
          $location.path('signin');
        }
      }
    });
  }
]);