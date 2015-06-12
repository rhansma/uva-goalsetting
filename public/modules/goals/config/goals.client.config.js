'use strict';

// Goals module config
angular.module('goals').run(['Menus',
  function(Menus) {
    //Set topbar menu
    Menus.addMenuItem('topbar', 'Public goal feed', 'goals/public', 'item', '/goals/public', false, ['teacher']);
    Menus.addMenuItem('topbar', 'Goal overview', 'goals', 'item', '/goals');
    Menus.addMenuItem('topbar', 'Inspiration', 'goals/commit', 'item', '/goals/commit');
    Menus.addMenuItem('topbar', 'Show statistics', 'user/goals/statistics', 'item', '/user/goals/statistics');
  }
]);

angular.module('goals').constant('angularMomentConfig', {
  timezone: 'Europe/Amsterdam'
});

angular.module('goals').run(['notify', function(notify) {
    notify.config({
      duration: 1500
    });
  }
]);