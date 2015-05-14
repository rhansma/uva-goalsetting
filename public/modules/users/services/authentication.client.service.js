'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$http', '$q', '$state', '$rootScope',
	function($http, $q, $state, $rootScope) {
		var _this = this;

		_this._data = {
			user: window.user
		};

    /* Define all access levels */
    _this.AUTH_LEVEL = {
      'public': 0,
      'student': 1,
      'teacher': 2
    };

    /* Define all auth events */
    _this.AUTH_EVENTS = {
      'unauthorized': 'Insufficient rights',
      'unauthenticated': 'Not logged in',
      'loggedin': 'User is logged in',
      'loggedout': 'User is logged out',
      'reloadMenu': 'Reload the menu'
    };

    /* Define all public states */
    _this.publicStates = ['home', 'signin', 'signup', 'unauthorized'];

    /* Check if user may access the route */
    _this.authorize = function(accessLevel) {
      var authorized = (accessLevel === 0);

      if(_this._data.user !== null  && _this._data.user !== '') {
        /* Check all roles if one is sufficient */
        angular.forEach(_this._data.user.roles, function(role, i) {
          if(accessLevel - _this.AUTH_LEVEL[role] <= 0) {
            authorized = true;
          }
        });
      }

      return authorized;
    };

    /* Check if user is logged in */
    _this.isLoggedIn = function() {
      var deferred = $q.defer();

      $http.get('auth/authenticated').success(function(){
        deferred.resolve(true);
      }).error(function(){
        deferred.reject(false);
      });

      return deferred.promise;
    };

    /* Check if current state is a public one */
    _this.checkStateIsPublic = function() {
      var publicState = false;

      angular.forEach(_this.publicStates, function(state, i) {
        if(state === $state.current.name){
         publicState = true;
        }
      });

      return publicState;
    };

    /* Reload user on log in or log out */
    _this.reloadUser = function() {
      _this._data.user = window.user;
      $rootScope.$emit(_this.AUTH_EVENTS.reloadMenu);
    };

    /* Checks if the user is a teacher */
    _this.isTeacher = function() {
      var teacher = false;

      angular.forEach(_this._data.user.roles, function(role) {
        if(role === 'teacher') {
          teacher = true;
        }
      });

      return teacher;
    };

    $rootScope.$on(_this.AUTH_EVENTS.loggedin, _this.reloadUser);
    $rootScope.$on(_this.AUTH_EVENTS.loggedout, _this.reloadUser);

		return _this;
	}
]);