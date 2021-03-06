'use strict';
/* global Modernizr */

angular.module('goals').controller('GoalsController', ['$scope', 'Goals', 'Authentication', '$location', '$stateParams', 'moment', 'notify', '$state', 'socket',
	function($scope, Goals, Authentication, $location, $stateParams, moment, notify, $state, socket) {
    $scope.loading = true;
    $scope.page = 1;
    $scope.goals = [];


    /* If goal is created update with public goal feed */
    socket.on('create', function(data) {
      if($state.is('publicGoalsFeed')) {
        $scope.goals.unshift(data);
      }
    });

    $scope.authentication = Authentication._data;
    $scope.teacher = Authentication.isTeacher();

    $scope.create = function() {
      $scope.spinner = true;

      var goal = new Goals({
        title: this.title,
        expires: this.expires,
        private: this.private
      });

      goal.$save(function(response) {
        $location.path('goals');

        $scope.title = '';
        $scope.expires = '';
        $scope.spinner = false;
        socket.emit('create', goal);
        notify({message: 'Your goal has been created. If you chose to make your goal public it will be available for others after being rated by the teacher.', classes: 'success', templateUrl: 'modules/goals/partials/angular-notify.client.partial.html', duration: '3500'});
      }, function(errorResponse) {
        $scope.spinner = false;
        $scope.error = errorResponse.data.message;
      });
    };

    $scope.update = function() {
      $scope.spinner = true;
      var goal = $scope.goal;

      goal.$update(function() {
        $scope.spinner = false;
        $location.path('goals/' + goal._id);
      }, function(errorResponse) {
        $scope.spinner = false;
        $scope.error = errorResponse.data.message;
      });
    };

    /**
     * Handle click on goal depending on state of public goal feed
     * @param goal
     */
    $scope.goalClick = function(goal) {
      if($scope.edit) {
        $state.go('viewGoal', {'goalId': goal._id});
      } else {
        goal.highlight = !goal.highlight;
      }
    };

    $scope.remove = function(goal) {
      if (goal) {
        Goals.remove({
          goalId: goal._id
        });

        for (var i in $scope.goals) {
          if ($scope.goals[i] === goal) {
            $scope.goals.splice(i, 1);
          }
        }
      } else {
        $scope.goal.$remove(function() {
          $location.path('goals');
        });
      }
    };

    $scope.findOne = function() {
      $scope.goal = Goals.get({
        goalId: $stateParams.goalId
      }, function() {
        /* Rewrite all dates for input[date] */
        $scope.goal.expires = new Date(moment($scope.goal.expires).format('YYYY-MM-DD'));

        for(var i in $scope.goal.subgoals) {
          $scope.goal.subgoals[i].expires = new Date(moment($scope.goal.subgoals[i].expires).format('YYYY-MM-DD'));
        }
      });
    };

    $scope.getGoals = function() {
      /* Only load new page if more results available */
      if($scope.page) {
        $scope.loading = true;
        $scope.tmpGoals = Goals.getMoreGoals({page: $scope.page});
        $scope.tmpGoals.$promise.then(function(data) {
          angular.forEach(data[1], function(value) {
            $scope.goals.push(value);
          });

          /* Check if more results, increment page with one if so, else set false */
          $scope.page = data[0] ? $scope.page + 1 : false;
          $scope.loading = false;
        });
      }
    };

    /* Save teacher edits */
    $scope.save = function() {
      $scope.spinner = true;
      var successes = 0;
      /* Loop through all goals and update them */
      angular.forEach($scope.goals, function(goal) {
        Goals.teacherUpdate({
          goalId: goal._id
        }, function() {
          successes++;

          /* Show message if all changes are saved */
          if(successes === $scope.goals.length) {
            notify({message: 'Changes saved!', classes: 'alert', templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
            $scope.spinner = false;
          }
        }, function(errorResponse) {
          $scope.spinner = false;
          $scope.error = errorResponse.data.message;
        });
      });
    };

    /* Save teacher edits */
    $scope.saveGoal = function(goal) {
      if(goal.rating > 0 && goal.rating <= 10) {
        $scope.spinner = true;

        Goals.teacherUpdate(goal, function() {
          notify({message: 'Changes saved!', classes: 'alert', templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
          $scope.spinner = false;
        }, function(errorResponse) {
          $scope.spinner = false;
          $scope.error = errorResponse.data.message;
        });
      }
    };

    /* Publish all rated goals */
    $scope.publish = function() {
      $scope.spinner = true;
      Goals.publish(function(goals) {
        $scope.spinner = false;
        notify({message: 'All rated goals are published, students can now commit or reject to them.', classes: 'alert', templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
        $scope.goals = goals;
      }, function(errorResponse) {
        $scope.spinner = false;
        $scope.error = errorResponse.data.message;
      });
    };

    /* Add a empty subgoal */
    $scope.addSubgoal = function() {
      this.goal.subgoals.push({});
    };
	}
]);

/* Directive for checking if specified date is in future */
angular.module('goals')
  .directive('dateInFuture', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attr, ctrl) {
        ctrl.$parsers.unshift(function(value) {
          var valid;

          if(value) {
            valid = new Date() < new Date(value);
            ctrl.$setValidity('dateInPast', valid);
          }

          return valid ? value : undefined;
        });
      }
    };
});

angular.module('goals').directive('dateField', function() {
  return {
    restrict: 'A',
    require : 'ngModel',
    compile: function(tElem, attr) {
      /* Check if input date is supported, if not change to type text for datepicker */
      if(!Modernizr.inputtypes.date) {
        attr.$set('type', 'text');

        return function(scope, element, attrs, ngModelCtrl) {
          /* Add datepicker if date input is not supported and bind ngmodel */
          if(!Modernizr.inputtypes.date) {
            angular.element(function(){
              element.datepicker({
                dateFormat:'mm/dd/yy',
                onSelect:function (date) {
                  scope.$apply(function () {
                    ngModelCtrl.$setViewValue(date);
                  });
                }
              });
            });
          }
        };
      }
    }
  };
});

angular.module('goals').directive('whenScrolled', function() {
  return function(scope, elm, attr) {
    var raw = elm[0];

    elm.bind('scroll', function() {
      if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
        scope.$apply(attr.whenScrolled);
      }
    });
  };
});
