'use strict';

angular.module('goals').controller('UserGoalsController',
  ['$scope', 'UserGoals', 'Goals', 'UserGoalGroups', '$state', 'notify', '$stateParams', 'moment', 'ngDialog',
	function($scope, UserGoals, Goals, UserGoalGroups, $state, notify, $stateParams, moment, ngDialog) {
    /* Find committed goals */
    $scope.find = function() {
      $scope.userGoals = UserGoals.query();
    };

    /* Find approved but not committed or rejected goals */
    $scope.findApproved = function() {
      $scope.goals = Goals.getApproved();
    };

    /* Find grouped goals */
    $scope.findGrouped = function() {
      $scope.userGoals = UserGoalGroups.get({
        userGoalGroupId: $stateParams.userGoalGroupId
      });
    };

    /* Find one user goal */
    $scope.findOne = function() {
      $scope.userGoal = UserGoals.get({
        userGoalId: $stateParams.userGoalId
      }, function() {
        for(var i in $scope.userGoal.subgoals) {
          $scope.userGoal.subgoals[i].expires = new Date(moment($scope.userGoal.subgoals[i].expires).format('YYYY-MM-DD'));
        }
      });
    };

    /* Save user goal status */
    $scope._saveUserGoal = function(goal, status) {
      var userGoal = new UserGoals({
        status: status,
        goal: goal
      });

      userGoal.$save(function(response) {
        $scope.success = response;
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    /* Add goals to the committed or rejected array */
    $scope.reject = function(goal) {
      for (var i in $scope.goals) {
        if ($scope.goals[i] === goal) {
          $scope.goals.splice(i, 1);
        }
      }

      $scope._saveUserGoal(goal, 'rejected');
    };

    $scope.commit = function(goal) {
      for (var i in $scope.goals) {
        if ($scope.goals[i] === goal) {
          $scope.goals.splice(i, 1);
        }
      }

      $scope._saveUserGoal(goal, 'committed');
    };

    $scope.abort = function() {
      /* Don't send again if already busy */
      if($scope.spinner) {
        return false;
      }

      /* Show dialog to confirm deletion */
      var dialog = ngDialog.openConfirm({
        template: '<p>Are you sure you want to delete this goal?</p>\
                  <div class="ngdialog-buttons">\
                      <button type="button" class="ngdialog-button ngdialog-button-secondary primary" ng-click="closeThisDialog(0)">No</button>\
                      <button type="button" class="ngdialog-button ngdialog-button-primary alert" ng-click="confirm(true)">Yes</button>\
                  </div>',
        plain: true
      });
      dialog.then(function(data) {
        if(data) {
          $scope.spinner = true;
          var userGoal = $scope.userGoal;

          userGoal.$abort(function() {
            notify({message: 'You\'ve aborted this goal', classes: 'alert', templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
            $scope.spinner = false;
            $state.go('committedGoals');
          }, function(errorResponse) {
            $scope.error = errorResponse.data.message;
            $scope.spinner = false;
          });
        }
      });
    };

    /* Drag-and-drop functionality for grouping goals */
    $scope.onDropComplete = function(source, target){
      var userGoalGroup;
      /* Create a new userGoalGroup */
      if($scope.userGoals[target].group === undefined && $scope.userGoals[source].group === undefined) {
        userGoalGroup = new UserGoalGroups({
          parent: $scope.userGoals[target]._id,
          children: [$scope.userGoals[source]._id]
        });

        userGoalGroup.$save(function() {
          $state.reload();
          notify({message: 'Goals are grouped, click on the plus sign to show all goals in the group.', classes: 'success', templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
        }, function(errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      } else { /* Or update existing */
        /* Dont group already grouped goals */
        if($scope.userGoals[source].group !== undefined) {
          notify({message: 'It is not possible to group already grouped goals. Drag a non grouped goal to a group for grouping more than two goals.', classes: 'alert', templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
        } else {
          userGoalGroup = new UserGoalGroups({
            _id: $scope.userGoals[target].group,
            child: $scope.userGoals[source]._id
          });

          userGoalGroup.$update(function() {
            $state.reload();
            notify({message: 'Goal is added to the group, click on the plus sign to show all goals in the group.', classes: 'success', templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
          }, function(errorResponse) {
            $scope.error = errorResponse.data.message;
          });
        }
      }
    };

    /* Order by status */
    $scope.orderFunction = function(userGoal) {
      switch (userGoal.status) {
        case 'committed':
          return 0;
          break;
        case 'finished':
          return 1;
          break;
        case 'expired':
          return 2;
          break;
        case 'aborted':
          return 3;
          break;
        default:
          return 4;
          break;
      }
    };

    /* Save goal with new state */
    $scope.save = function() {
      $scope.spinner = true;
      /* Do nothing if goal is aborted */
      if($scope.userGoal.status === 'aborted' || $scope.checkExpired($scope.userGoal.goal.expires)) {
        return false;
      }

      var goal = $scope.userGoal;

      goal.$update(function() {
        $scope.spinner = false;
        notify({message: 'Succesfully saved', templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
      }, function(errorResponse) {
        $scope.spinner = false;
        notify({message: errorResponse.data.message, templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
      });
    };

    /* Retrieve statistics for chart */
    $scope.getStatistics = function() {
      $scope.labels = [];
      $scope.data = [[],[],[]];
      $scope.series = ['Completed goals', 'Committed goals', 'Aborted goals'];
      $scope.options = {
        scaleBeginAtZero: true
      };

      /* Get statistics on goals */
      $scope.statistics = UserGoals.getStatistics(function(){
        $scope.statistics.completed = 0;
        var aborted = 0;
        var finished = 0;
        var committed = 0;

        /* Loop through all committed goals */
        angular.forEach($scope.statistics.committed, function(elem) {
          var object = elem._id;
          var date = moment(new Date(object.year, object.month - 1, object.day)).format('MMM Do');

          /* Push to array if not yet present */
          if($scope.labels.indexOf(date) === -1) {
            $scope.labels.push(date); // Subtract one month because months are from 0-11 instead of 1-12
          }

          committed += elem.total;
          $scope.data[1].push(committed);
        });

        /* Loop through other state changes */
        angular.forEach($scope.statistics.finished, function(elem) {
          var object = elem._id;
          var date = moment(new Date(object.year, object.month - 1, object.day)).format('MMM Do');

          /* Push to array if not yet present */
          if($scope.labels.indexOf(date) === -1) {
            $scope.labels.push(date); // Subtract one month because months are from 0-11 instead of 1-12
          }

          /* Count totals for right status */
          switch(object.status) {
            case 'aborted':
              aborted += elem.total;
              $scope.data[2].push(aborted);
              break;
            case 'finished':
              finished += elem.total;
              $scope.data[0].push(finished);
              break;
          }
        });

        $scope.finished = $scope.rejected = $scope.aborted = $scope.expired = $scope.committed = 0;
        angular.forEach($scope.statistics.statistics, function(value) {
          switch(value._id) {
            case 'finished':
              $scope.finished = value.total;
              break;
            case 'rejected':
              $scope.rejected = value.total;
              break;
            case 'aborted':
              $scope.aborted = value.total;
              break;
            case 'expired':
              $scope.expired = value.total;
              break;
            case 'committed':
              $scope.committed = value.total;
              break;
          }

          $scope.total = $scope.finished + $scope.rejected + $scope.aborted + $scope.expired + $scope.committed;
        });
      });
    };

    $scope.addSubgoal = function() {
      $scope.userGoal.subgoals.push({});
    };

    /* Check if a goal is expired */
    $scope.checkExpired = function(expiryDate) {
      console.log(expiryDate);
      return moment(expiryDate).isBefore(new Date());
    };
  }
]);

/* Filter for conditionally showing a plus only if not empty */
angular.module('goals').filter('addPlus', function() {
  return function(input) {
    return((input === undefined) | (input === 0))? '' : '+' + input;
  };
});

angular.module('goals').controller('ModalController', ['$scope', 'close',
  function ($scope, close) {
    $scope.close = function (result) {
      close(result);
    }
  }
]);