'use strict';

angular.module('admin').factory('Admin', ['$resource',
	function($resource) {
		return $resource('admin', {

    }, {
      getUsers: {
        method: 'GET',
        isArray: true,
        url: 'admin/users'
      },
      getTeachers: {
        method: 'GET',
        isArray: true,
        url: 'admin/teachers'
      }
    });
	}
]);