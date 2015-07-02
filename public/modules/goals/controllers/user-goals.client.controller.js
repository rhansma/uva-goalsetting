'use strict';

angular.module('goals').controller('UserGoalsController',
  ['$scope', 'UserGoals', 'Goals', 'UserGoalGroups', '$state', 'notify', '$stateParams', 'moment', 'ngDialog', 'Statistics', '$animate',
	function($scope, UserGoals, Goals, UserGoalGroups, $state, notify, $stateParams, moment, ngDialog, Statistics, $animate) {
    $scope.index = 5;
    $scope.show = function(index) {
      if(index < $scope.index) {
        true;
      }
    };

    setInterval(function() {
      $scope.index += 5;
    }, 1000);
    $animate.enabled(false);
    $scope.loading = true;

    $scope.addTag = function(tag) {
      UserGoals.addTag({tag: tag.text, _id: $scope.userGoal._id}, function() {
        notify({message: tag.text + ' is added as tag to this goal', classes: 'alert', templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
      });
    };

    /* Find committed goals */
    $scope.find = function() {
      $scope.userGoals = UserGoals.query(function() {
        $scope.loading = false;
      });
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

    $scope.abort = function(userGoal) {
      /* Don't send again if already busy */
      if($scope.spinner) {
        return false;
      }

      /* Show dialog to confirm deletion */
      var dialog = ngDialog.openConfirm({
        template: '<p>Are you sure you want to delete this goal?</p>' +
                  '<div class="ngdialog-buttons">' +
                      '<button type="button" class="ngdialog-button ngdialog-button-secondary primary" ng-click="closeThisDialog(0)">No</button>' +
                      '<button type="button" class="ngdialog-button ngdialog-button-primary alert" ng-click="confirm(true)">Yes</button>' +
                  '</div>',
        plain: true
      });
      dialog.then(function(data) {
        if(data) {
          $scope.spinner = true;

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

      if($scope.userGoals[target].status !== 'committed') {
        return false;
      }

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
      var order = 4;
      switch (userGoal.status) {
        case 'committed':
          order = 0;
          break;
        case 'finished':
          order = 1;
          break;
        case 'expired':
          order = 2;
          break;
        case 'aborted':
          order = 3;
          break;
        default:
          order = 4;
          break;
      }

      return order;
    };

    /* Save goal with new state */
    $scope.save = function() {
      $scope.spinner = true;
      /* Do nothing if goal is aborted */
      if($scope.userGoal.status === 'aborted' || $scope.checkExpired($scope.userGoal.goal.expires)) {
        return false;
      }

      var goal = $scope.userGoal;

      goal.$update(function(goal) {
        $scope.spinner = false;
        notify({message: 'Successfully saved', templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
        $scope.userGoal = goal;
      }, function(errorResponse) {
        $scope.spinner = false;
        notify({message: errorResponse.data.message, templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
      });
    };

    /* Retrieve statistics for chart */
    $scope.getStatistics = function() {
      $scope.labels = [];
      $scope.data = [[],[],[]];
      $scope.series = ['Completed goals', 'Committed goals', 'Aborted goals', 'Pending goals'];
      $scope.options = {
        scaleBeginAtZero: true
      };

      /* Get statistics on goals */
      $scope.statistics = UserGoals.getStatistics(function(){
        $scope.statistics.completed = 0;
        var aborted = 0;
        var finished = 0;
        var committed = 0;

        Statistics.getStatistics($scope.statistics).then(function(rawData) {
          $scope.labels = rawData.labels;
          $scope.data[0] = rawData.data.finished;
          $scope.data[1] = rawData.data.committed;
          $scope.data[2] = rawData.data.aborted;
          $scope.data[3] = rawData.data.pending;

          $scope.total = rawData.totals.committed;
          $scope.finished = rawData.totals.finished;
          $scope.aborted = rawData.totals.aborted;
          $scope.expired = rawData.totals.expired;
          $scope.committed = rawData.totals.committed;

          $scope.loading = false;
        });
      });
    };

    $scope.addSubgoal = function() {
      $scope.userGoal.subgoals.push({});
    };

    /* Check if a goal is expired */
    $scope.checkExpired = function(expiryDate) {
      return moment(expiryDate).isBefore(new Date());
    };

    $scope.finish = function(goal) {
      $scope.spinner = true;

      goal.$finish(function() {
        $scope.spinner = false;
        notify({message: 'Successfully finished goal', templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
      }, function(errorResponse) {
        $scope.spinner = false;
        notify({message: errorResponse.data.message, templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
      });
    };

    $scope.finishSubgoal = function(subgoal) {
      $scope.spinner = true;

      UserGoals.finishSubgoal({'subGoalId': subgoal._id}, function() {
        $scope.spinner = false;
        notify({message: 'Successfully finished subgoal', templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
      }, function(errorResponse) {
        $scope.spinner = false;
        notify({message: errorResponse.data.message, templateUrl: 'modules/goals/partials/angular-notify.client.partial.html'});
      });
    };

    $scope.countCompletedSubgoals = function(subgoals) {
      var finished = 0;

      angular.forEach(subgoals, function(subgoal) {
        if(subgoal.finished) {
          finished += 1;
        }
      });

      return finished;
    };

    $scope.activeTab = 'statistics';

    /**
     * Switch from tabs (statistics)
     * @param tab
     */
    $scope.openTab = function(tab) {
      $scope.activeTab = tab;
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
    };
  }
]);