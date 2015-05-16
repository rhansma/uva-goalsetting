'use strict';

angular.module('goals').factory('Goals', ['$resource',
  function($resource) {
    return $resource('goals/:goalId', {
      goalId: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
      teacherUpdate: {
        method: 'PUT',
        url: 'goals/:goalId/teacher'
      },
      getApproved: {
        method: 'get',
        isArray: true,
        url: 'goals/approved'
      }
    });
  }
]);