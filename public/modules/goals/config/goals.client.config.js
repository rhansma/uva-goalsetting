'use strict';

// Goals module config
angular.module('goals').run(['Menus', '$rootScope', 'Authentication', '$location',
  function(Menus, $rootScope, Authentication, $location) {
    //Set topbar menu
    Menus.addMenuItem('topbar', 'Goals', 'goals', 'dropdown', '/goals(/create)?');
    Menus.addSubMenuItem('topbar', 'goals', 'List Goals', 'goals');
    Menus.addSubMenuItem('topbar', 'goals', 'New Goal', 'goals/create');

    /* Authorize all requests */
    $rootScope.$on('$stateChangeStart', function(event, next, current) {
      if(!Authentication.authorize(next.accessLevel)) {
        if(Authentication.isLoggedIn()) {
          $location.path('unauthorized');
        } else {
          $location.path('signin');
        }
      }
    });
  }
]);