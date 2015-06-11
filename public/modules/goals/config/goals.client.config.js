'use strict';

// Goals module config
angular.module('goals').run(['Menus',
  function(Menus) {
    //Set topbar menu
    Menus.addMenuItem('topbar', 'Public goal feed', 'goals/public', 'item', '/goals/public');
    Menus.addMenuItem('topbar', 'Goal overview', 'goals', 'item', '/goals');
    Menus.addMenuItem('topbar', 'Show statistics', 'user/goals/statistics', 'item', 'user/goals/statistics');
  }
]);

angular.module('goals').constant('angularMomentConfig', {
  timezone: 'Europe/Amsterdam'
});