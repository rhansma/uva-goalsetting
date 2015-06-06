'use strict';

// Goals module config
angular.module('goals').run(['Menus',
  function(Menus) {
    //Set topbar menu
    Menus.addMenuItem('topbar', 'Goals', 'goals', 'item', '/goals');
    Menus.addMenuItem('topbar', 'Create Goal', 'goals/create', 'item', '/goals/create');
    Menus.addMenuItem('topbar', 'Show committed goals', 'goals/committed', 'item', '/goals/committed');
  }
]);

angular.module('goals').constant('angularMomentConfig', {
  timezone: 'Europe/Amsterdam'
});