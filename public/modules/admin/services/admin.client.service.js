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
      },
      getNotTeachers: {
        method: 'GET',
        isArray: true,
        url: 'admin/not/teachers'
      },
      addTeacherRole: {
        method: 'GET',
        url: '/user/teacher/add/:userId',
        userId: '@id'
      },
      addUser: {
        method: 'POST',
        url: '/admin/user'
      }
    });
	}
]);