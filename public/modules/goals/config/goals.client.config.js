'use strict';

// Goals module config
angular.module('goals').run(['Menus',
  function(Menus) {
    //Set topbar menu
    Menus.addMenuItem('topbar', 'Goals', 'goals', 'item', '/goals');
    Menus.addMenuItem('topbar', 'Create Goal', 'goals/create', 'item', '/goals/create');
  }
]);