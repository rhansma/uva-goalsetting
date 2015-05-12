'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$rootScope', '$injector',
			function($q, $rootScope, $injector) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
                var Authentication = $injector.get('Authentication');

                /* Only emit event and deauthenticate if state is not public */
                if(!Authentication.checkStateIsPublic()) {
                  // Deauthenticate the global user
                  Authentication._data.user = null;

                  /* Emit event so this can be handled equally */
                  $rootScope.$emit(Authentication.AUTH_EVENTS.unauthenticated);
                }
								break;
							case 403:
                $rootScope.$emit(Authentication.AUTH_EVENTS.unauthorized);
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
          $rootScope.$emit(Authentication.AUTH_EVENTS.unauthorized);
        } else {
          $rootScope.$emit(Authentication.AUTH_EVENTS.unauthenticated);
        }
      }
    });

    /* Catch authentication and authorization events */
    $rootScope.$on(Authentication.AUTH_EVENTS.unauthenticated, function() {
      $location.path('signin');
    });

    $rootScope.$on(Authentication.AUTH_EVENTS.unauthorized, function() {
      $location.path('unauthorized');
    });
  }
]);