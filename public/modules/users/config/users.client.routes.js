'use strict';

// Setting up route
angular.module('users').config(['$stateProvider', 'AUTH_LEVEL',
	function($stateProvider, AUTH_LEVEL) {
		// Users state routing
		$stateProvider.
		state('signout', {
			url: '/auth/signout',
			controller: function($http, $location) {
        $http.get('auth/signout');
        $location.path('/');
      }
		}).
		state('unauthorized', {
			url: '/unauthorized',
			templateUrl: 'modules/users/views/unauthorized.client.view.html',
      accessLevel: AUTH_LEVEL.public
		}).
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html',
        accessLevel: AUTH_LEVEL.student
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html',
        accessLevel: AUTH_LEVEL.student
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html',
      accessLevel: AUTH_LEVEL.public
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html',
      accessLevel: AUTH_LEVEL.public
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html',
      accessLevel: AUTH_LEVEL.public
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html',
      accessLevel: AUTH_LEVEL.public
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html',
      accessLevel: AUTH_LEVEL.public
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html',
      accessLevel: AUTH_LEVEL.public
		});
	}
]);