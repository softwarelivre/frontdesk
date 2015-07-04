(function() {
  "use strict";

  angular
    .module('segue.frontdesk.people', [
      'ui.keypress',
      'segue.frontdesk.authenticate.service',
      'segue.frontdesk.people.controller',
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
          url: '/people/:query',
          views: {
            "query@":   { controller: 'PersonSearchController', templateUrl: 'modules/People/people.query.html' },
            "content@": { controller: 'PersonSearchController', templateUrl: 'modules/People/people.list.html' }
          },
          resolve: {
            people: function(People, $stateParams) { return People.lookup({ needle: $stateParams.query }); },
          }
        });
    });

  angular
    .module('segue.frontdesk.people.controller', [])
    .controller('PersonSearchController', function($scope, $state, focusOn, people) {
      $scope.enforceAuth();
      $scope.query = { needle: $state.params.query };
      $scope.results = people;
      $scope.focusedIndex = -1;

      $scope.performSearch = function() {
        $state.go('people.search', { query: $scope.query.needle });
      };

      $scope.moveFocusTo = function(index) {
        $scope.focusedIndex = index;
        if ($scope.focusedIndex < 0) { return $scope.focusInput(); }
        $scope.focusedIndex %= $scope.results.length;
        focusOn("result-"+$scope.focusedIndex);
      };

      $scope.focusHasMovedTo = function($index) {
        $scope.focusedIndex = $index;
      };

      $scope.selectPerson = function($index) {
        $state.go('people.detail', { id: $scope.results[$index].id });
      };

      $scope.keypress = {
        query: {
          enter: $scope.performSearch,
          down:  _.partial($scope.moveFocusTo, 0)
        },
        person: function($index) {
          return {
            enter: _.partial($scope.selectPerson, $index),
            up:    _.partial($scope.moveFocusTo,  $index-2),
            down:  _.partial($scope.moveFocusTo,  $index+2),
            left:  _.partial($scope.moveFocusTo,  $index-1),
            right: _.partial($scope.moveFocusTo,  $index+1),
          };
        }
      };
      $scope.focusInput = function() {
        $scope.focusedIndex = -1;
        focusOn('query.needle');
      };

      $scope.focusInput();
    });
})();
