(function() {
  "use strict";

  angular
    .module('segue.frontdesk.people', [
      'ui.keypress',
      'segue.frontdesk.authenticate.service',
      'segue.frontdesk.people.controller',
      'segue.frontdesk.people.steps',
      'segue.frontdesk.people.service'
    ])
    .config(function($stateProvider) {
      $stateProvider
        .state('people', {
          abstract: true,
          url: '^/people',
          views: { }
        })
        .state('people.search', {
          url: '/:query',
          views: {
            "query@":   { controller: 'PersonSearchController', templateUrl: 'modules/People/people.query.html' },
            "content@": { controller: 'PersonSearchController', templateUrl: 'modules/People/people.list.html' }
          },
          resolve: {
            people: function(People, $stateParams) { return People.lookup({ needle: $stateParams.query }); },
          }
        })
        .state('people.person', {
          url: '/one/:xid',
          views: {
            "content@": { controller: 'PersonController', templateUrl: 'modules/People/person.html' }
          },
        });
    });

  angular
    .module('segue.frontdesk.people.controller', [])
    .controller('PersonController', function($scope, $state, People, focusOn) {
      console.log('person ctrl');
//      $state.go('people.person.country');

      $scope.fastForward = function(nextState) {
        $state.go(nextState);
      };

      $scope.reload = function(nextState) {
        People.getOne($state.params.xid).then(function(person) {
          $scope.person = person;
          if (nextState) { $state.go(nextState); }
//          if (nextState === 'person') {
//            $state.go('person');
//          }
//          else if ($state.is('person')) {
//            $state.go(decideState());
//          }
//          else if (nextState) {
//            $state.go(nextState);
//          }
        });
      };

      $scope.autoFocusOption = function(options, currentValue, customComparatorFn) {
        $scope.enteredOption = null;
        var comparatorFn = customComparatorFn || function(entry) { return entry == currentValue; };
        var matches = _.map(options, comparatorFn);

        if (_.includes(matches, true)) {
          $scope.focusOption(options.length, matches.indexOf(true));
        } else if (currentValue) {
          $scope.enteredOption = currentValue;
          $scope.focusOption(options.length, options.length);
        } else {
          $scope.focusOption(options.length, 0);
        }
      };

      $scope.focusOption = function(length, index) {
        if (index > length) { return; }
        if (index < 0) { return; }
        $scope.currentIndex = index;
        focusOn('option-'+index);
      };

      $scope.reload();
    })
    .controller('PersonSearchController', function($scope, $state, $anchorScroll, focusOn, people) {
      $scope.enforceAuth();
      $scope.query = { needle: $state.params.query };
      $scope.results = people;
      $scope.focusedIndex = -1;

      $scope.performSearch = function() {
        $state.go('people.search', { query: $scope.query.needle });
      };

      $scope.moveFocusTo = function(index, $event) {
        if ($event)    { $event.stopPropagation(); }
        if (index < 0) { return $scope.focusInput(); }

        $scope.focusedIndex = index;
        $scope.focusedIndex %= $scope.results.length;
        focusOn("result-"+$scope.focusedIndex);
      };

      $scope.focusHasMovedTo = function($index) {
        $scope.focusedIndex = $index;
      };

      $scope.selectPerson = function($index) {
        $state.go('people.person', { xid: $scope.results[$index].id });
      };

      $scope.keypress = {
        query: {
          enter: $scope.performSearch,
          down:  _.partial($scope.moveFocusTo, 0, null)
        },
        person: function($index, $event) {
          return {
            esc:   $scope.focusInput,
            enter: _.partial($scope.selectPerson, $index),
            up:    _.partial($scope.moveFocusTo,  $index-2, $event),
            down:  _.partial($scope.moveFocusTo,  $index+2, $event),
            left:  _.partial($scope.moveFocusTo,  $index-1, $event),
            right: _.partial($scope.moveFocusTo,  $index+1, $event),
          };
        }
      };
      $scope.focusInput = function() {
        $scope.focusedIndex = -1;
        focusOn('query.needle');
      };

      $anchorScroll("#query-needle");
      $scope.focusInput();
    });
})();
