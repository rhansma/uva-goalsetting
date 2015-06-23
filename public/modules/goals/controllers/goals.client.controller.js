'use strict';
/* global Modernizr */

angular.module('goals').controller('GoalsController', ['$scope', 'Goals', 'Authentication', '$location', '$stateParams', 'moment', 'notify', '$state', 'socket',
	function($scope, Goals, Authentication, $location, $stateParams, moment, notify, $state, socket) {
    $scope.loading = true;

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
        goal.$remove();

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

    $scope.find = function() {
      $scope.goals = Goals.query(function() {
        $scope.loading = false;
      });
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

    /* Save teacher edits */
    $scope.save = function() {
      $scope.spinner = true;
      var successes = 0;
      /* Loop through all goals and update them */
      angular.forEach($scope.goals, function(goal) {
        goal.$teacherUpdate(function() {
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