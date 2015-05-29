'use strict';

/**
 * Created by:    Robin Hansma (robin@ihatestatistics.com)
 * Date:          15-5-2015
 */
angular.module('goals').factory('UserGoals', ['$resource',
  function($resource) {
    return $resource('user/goals/:userGoalId', {
      userGoalId: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
      getStatistics: {
        method: 'GET',
        url: 'user/goals/statistics'
      }
    });
  }
]);