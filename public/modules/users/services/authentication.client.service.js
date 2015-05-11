'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [
	function() {
		var _this = this;

		_this._data = {
			user: window.user
		};

    /* Define all access levels */
    _this.AUTH_LEVEL = {
      'public': 7, //111
      'student': 6, //110
      'teacher': 4 //100
    };

    /* Check if user may access the route */
    _this.authorize = function(accessLevel, role) {
      if(role === undefined) {
        role = _this._data.user.role;
      }

      /* Use bitwise operations to check access level */
      return accessLevel & role;
    };

    /* Check if user is logged in */
    _this.isLoggedIn = function() {
      return true;

      //ToDo: Make this work
    };

		return _this;
	}
]);