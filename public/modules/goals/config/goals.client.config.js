'use strict';

// Goals module config
angular.module('goals').run(['Menus',
  function(Menus) {
    //Set topbar menu
    Menus.addMenuItem('topbar', 'Goals', 'goals', 'dropdown', '/goals(/create)?');
    Menus.addSubMenuItem('topbar', 'goals', 'List Goals', 'goals');
    Menus.addSubMenuItem('topbar', 'goals', 'New Goal', 'goals/create');
  }
]);