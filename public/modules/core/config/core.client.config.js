'use strict';

/**
 * Created by Robin on 12-5-2015.
 */

angular.module('core').run(['$rootScope',
  function($rootScope) {
    $rootScope.$on('$viewContentLoaded', function () {
      $(document).foundation();
    });
  }
]);