'use strict';

/**
 * Created by:    Robin Hansma (robin@ihatestatistics.com)
 * Date:          15-5-2015
 */
angular.module('goals').factory('UserGoals', ['$resource',
  function($resource) {
    return $resource('user/goals/:userGoalId', {
      userGoalId: '@_id',
      subGoalId: '@subGoalId'
    }, {
      update: {
        method: 'PUT'
      },
      getStatistics: {
        method: 'GET',
        url: 'user/goals/statistics'
      },
      abort: {
        method: 'PUT',
        url: 'user/goals/:userGoalId/abort'
      },
      finish: {
        method: 'PUT',
        url: 'user/goals/:userGoalId/finish'
      },
      finishSubgoal: {
        method: 'PUT',
        url: 'user/subgoals/:subGoalId/finish'
      }
    });
  }
]);