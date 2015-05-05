'use strict';

angular.module('goals').factory('Goals', ['$resource',
  function($resource) {
    return $resource('goals/:goalId', {
      articleId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);