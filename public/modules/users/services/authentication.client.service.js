'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$http', '$q',
	function($http, $q) {
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

    /* Check if user may access the route */
    _this.authorize = function(accessLevel) {
      var authorized = false;

      /* Check all roles if one is sufficient */
      angular.forEach(_this._data.user.roles, function(role, i) {
        if(accessLevel - _this.AUTH_LEVEL[role] <= 0) {
          authorized = true;
        }
      });

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

		return _this;
	}
]);