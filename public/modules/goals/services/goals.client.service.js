'use strict';

angular.module('goals').factory('Goals', ['$resource',
  function($resource) {
    return $resource('goals/:goalId', {
      goalId: '@_id',
      page: '@page'
    }, {
      update: {
        method: 'PUT'
      },
      teacherUpdate: {
        method: 'PUT',
        url: 'goals/teacher/:goalId'
      },
      getApproved: {
        method: 'GET',
        isArray: true,
        url: 'goals/approved'
      },
      publish: {
        method: 'PUT',
        isArray: true,
        url: 'goals/teacher/publish'
      },
      getMoreGoals: {
        method: 'GET',
        isArray: true,
        url: 'goals/?page=:page'
      }
    });
  }
]);