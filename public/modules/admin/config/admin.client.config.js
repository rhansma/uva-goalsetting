'use strict';

/**
 * Created by Robin on 16-6-2015.
 */

angular.module('admin').run(['Menus',
  function(Menus) {
    //Set topbar menu
    Menus.addMenuItem('topbar', 'Admin dashboard', 'dashboard', 'item', '/dashboard', false, ['teacher']);
  }
]);