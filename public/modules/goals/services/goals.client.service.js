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
        url: 'goals/teacher/:goalId'
      },
      getApproved: {
        method: 'get',
        isArray: true,
        url: 'goals/approved'
      },
      publish: {
        method: 'PUT',
        url: 'goals/teacher/publish'
      }
    });
  }
]);