'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication', '$rootScope',
	function($scope, $http, $location, Authentication, $rootScope) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back to goals
		if ($scope.authentication._data.user) $location.path('/goals');

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				window.user = response;

        $rootScope.$emit(Authentication.AUTH_EVENTS.loggedin);

				// And redirect to the public goal feed
				$location.path('/goals');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				window.user = response;

        /* Emit login event */
        $rootScope.$emit(Authentication.AUTH_EVENTS.loggedin);
				// And redirect to the public goal feed
				$location.path('/goals');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);