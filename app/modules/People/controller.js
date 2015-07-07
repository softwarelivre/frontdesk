(function() {
  "use strict";

  angular
    .module('segue.frontdesk.people', [
      'ui.keypress',
      'segue.frontdesk.libs',
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
        })
        .state('people.person.create', {
          url: '/person/create',
          views: {
            "step": { controller: 'PersonCreateController', templateUrl: 'modules/People/steps/email.html' }
          }
        });
    });

  angular
    .module('segue.frontdesk.people.controller', [])
    .controller('PersonCreateController', function($scope, $state, People, FormErrors, focusOn) {
      $scope.step = { email: '' };
      $scope.keypress = { enter: commit };

      function commit() {
        People.createPerson($scope.step)
              .then(function(person) { $state.go('people.person.name', { xid: person.id }); })
              .catch(FormErrors.set);
      }
      focusOn('step.email');
    })


    .controller('PersonController', function($scope, $state, $q, FormErrors, People, DeviceType, focusOn) {
      if (DeviceType.isMobile()) {
        console.log("cannot access this page from tablet");
        $state.go('people.search');
      }

      function decideState() {
        if (!$scope.person) { return; }

        var needsName     = !$scope.person.name;
        var needsDocument = !$scope.person.document;
        var needsEmail    = !$scope.person.email;
        var needsCountry  = !$scope.person.country;

        var needsData   = _([ needsName, needsDocument, needsEmail, needsCountry ]).any();
        var needsPrint  = _($scope.person.last_badge).isEmpty();
        var needsTicket = !$scope.person.has_valid_ticket;

        if (needsData) {
          return 'people.person.email';
        }
        else if (needsTicket && $scope.person.can_change_product) {
          return 'people.person.product';
        }
        else if (needsTicket) {
          return 'people.person.payment';
        }
        else if (needsPrint) {
          return 'people.person.badge_name';
        }
        else {
          return 'people.person.give_badge';
        }
      }

      $scope.demand = function(testObject, raise) {
        $scope.validState = false;
        var testPasses = (testObject === true) || (!_.isEmpty(testObject));
        if (testPasses) {
          $scope.validState = true;
        }
        else if (raise) {
          $scope.reload();
          throw 'invalid state';
        }
        else {
          $scope.reload();
        }
      };

      $scope.fastForward = function(nextState) {
        $state.go(nextState);
      };

      $scope.reload = function(nextState, pipedPerson) {
        if ($state.is('people.person.create')) { return; }

        var loadPerson = $q.when(pipedPerson);
        if (!pipedPerson) { loadPerson = People.getOne($state.params.xid); }

        loadPerson.then(function(person) {
          $scope.person = person;
          if (nextState === 'people.person')   { $state.go('people.person'); }
          else if ($state.is('people.person')) { $state.go(decideState()); }
          else if (nextState)                  { $state.go(nextState); }
        });
      };

      $scope.restart = function() {
        $state.go('people.person', $state.params, { reload: true });
      };

      $scope.clearErrors = FormErrors.clear;

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

      $scope.empty = ($scope.query.needle.length > 0) && (people.length === 0);

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
