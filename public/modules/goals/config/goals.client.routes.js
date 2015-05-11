'use strict';

//Setting up route

//Fix this
angular.module('goals').constant('AUTH_LEVEL', {
  'public': 7, //111
  'student': 6, //110
  'teacher': 4 //100
});

angular.module('goals').config(['$stateProvider', 'AUTH_LEVEL',
	function($stateProvider, AUTH_LEVEL) {
		// Goals state routing
		$stateProvider.
    state('listGoals', {
      url: '/goals',
      templateUrl: 'modules/goals/views/list-goals.client.view.html',
      accessLevel: AUTH_LEVEL.public
    }).
    state('createGoal', {
      url: '/goals/create',
      templateUrl: 'modules/goals/views/create-goal.client.view.html',
      accessLevel: AUTH_LEVEL.student
    }).
		state('viewGoal', {
			url: '/goals/:goalId',
			templateUrl: 'modules/goals/views/view-goal.client.view.html',
      accessLevel: AUTH_LEVEL.student
		}).
		state('editGoal', {
			url: '/goals/:goalId/edit',
			templateUrl: 'modules/goals/views/edit-goal.client.view.html',
        accessLevel: AUTH_LEVEL.student
		});
	}
]);