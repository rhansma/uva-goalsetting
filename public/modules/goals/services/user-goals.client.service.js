'use strict';

/**
 * Created by:    Robin Hansma (robin@ihatestatistics.com)
 * Date:          15-5-2015
 */
angular.module('goals').factory('UserGoals', ['$resource',
  function($resource) {
    return $resource('user/goals/:goalId', {
      goalId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);