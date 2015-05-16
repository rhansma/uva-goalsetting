'use strict';

/**
 * Created by:    Robin Hansma (robin@ihatestatistics.com)
 * Date:          16-5-2015
 */

angular.module('goals').factory('UserGoalGroups', ['$resource',
  function($resource) {
    return $resource('user/goal/groups/:goalId', {
      goalId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);