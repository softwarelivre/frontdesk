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
          views: {
            header: { templateUrl: 'modules/common/nav.html' }
          }
        })
        .state('people.search', {
          url: '/:query',
          views: {
            "main@":   { controller: 'PersonSearchController', templateUrl: 'modules/People/people.query.html' },
            },
          resolve: {
            people: function(People, $stateParams) { return People.lookup({ needle: $stateParams.query }); },
          }
        })
        .state('people.person', {
          url: '/one/:xid',
          views: {
            "main@": { controller: 'PersonController', templateUrl: 'modules/People/person.html' }
          },
          resolve: {
            person: function(People, $stateParams) { return People.getOne($stateParams.xid); },
          }
        })
        .state('people.create', {
          url: '/person/create',
          views: {
            "main@": { controller: 'PersonCreateController', templateUrl: 'modules/People/steps/basic_info.html' }
          }
        });
    });

  angular
    .module('segue.frontdesk.people.controller', [])
    .controller('PersonCreateController', function($scope, $state, People, FormErrors, focusOn) {

      $scope.person = {};

      $scope.person.type = 'person';

      $scope.keypress = function(event) {
        switch(event.key) {
          case 'Enter': submit(); break;
        };
      }

      function submit() {
        People.createPerson($scope.person)
              .then(nextState)
              .catch(FormErrors.setError);
      }

      function nextState(person) {
        $state.go('people.person.address', { xid: person.id });
      }

      focusOn('person.name');

    })
    .controller('PersonController', function($scope, $state, $q, FormErrors, People, DeviceType, focusOn, person) {
      $scope.person = person;

      $scope.isCorporate = People.isCorporate($scope.person);


      function decideState() {
        if (!$scope.person) { return; }

        var needsName     = !$scope.person.name;
        var needsDocument = !$scope.person.document;
        var needsEmail    = !$scope.person.email;
        var needsCountry  = !$scope.person.country;

        var needsData   = _([ needsName, needsDocument, needsEmail, needsCountry ]).any();
        var needsPrint  = _($scope.person.last_badge).isEmpty();
        var needsTicket = !$scope.person.has_valid_ticket;


      //  if (needsPrint) {
       //   return 'people.person.badge';
      //  }

        if (needsData) {
          return 'people.person.basicinfo';
        }
        else if (needsTicket && $scope.person.can_change_product && !$scope.person.has_payable_ticket) {
          return 'people.person.product';
        }
        else if (needsTicket) {
          return 'people.person.payment';
        }
        else if (needsPrint) {
          return 'people.person.badge';
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

      $scope.reload = function(nextState) {
        if ($state.is('people.person.create')) { return; }

        if (nextState === 'people.person')   { $state.go('people.person'); }
        else if ($state.is('people.person')) { $state.go(decideState(),{}, {reload: true}); }
        else if (nextState)                  { $state.go(nextState, {}, {reload: true}); }
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
    .controller('PersonSearchController', function($scope, $state, $anchorScroll, focusOn, people, People, Flash, ngToast) {
      $scope.enforceAuth();
      $scope.query = { needle: $state.params.query };
      $scope.focusedIndex = -1;

      /*EXCLUDE DONATIONS*/
      //$scope.results = people;
      $scope.collapsed = {};

      //Fetched when the number of purchases where equal to 1
      $scope.person = null;

      $scope.purchasesByAccount = _.groupBy(people,'customer_id');

      $scope.isCollapsed = function(customer_id) {
        return ($scope.collapsed[customer_id] === true);
      };

      $scope.collapse = function(customer_id) {
        $scope.collapsed[customer_id] = true;
      };

      $scope.expand = function(customer_id) {
        $scope.collapsed[customer_id] = false;
      };

      $scope.corporateTickets = function(purchases) {
        return _.filter(purchases, function(purchase){
          return purchase.is_corporate;
        });
      };


      $scope.printBadge = function(purchase_id) {
        People.printBadge(purchase_id)
              .then(function(response) {
                ngToast.create({
                  content: 'Crachá enviado para a impressão.',
                  PurclassName: 'success',
                });
              })
              .catch(function(error) {
                  ngToast.create({
                    content:'Houve um na hora de imprimir.',
                    PurclassName: 'danger',
                  });
              });
      };

      $scope.printDonationBadge = function(purchase_id) {
        People.printDonationBadge(purchase_id)
              .then(function(response) {
                ngToast.create({
                  content: 'Crachá enviado para a impressão.',
                  PurclassName: 'success',
                });
              })
              .catch(function(error) {
                  ngToast.create({
                    content:'Houve um na hora de imprimir.',
                    PurclassName: 'danger',
                  });
              });
      };

      $scope.giveBadge = function() {
        if($scope.person) {
          People.giveBadge($scope.person.last_badge.id)
                .then(function(result) {
                  $scope.performSearch();
                })
                .catch();
        }
      };

      $scope.editBadge = function(purchase_id) {
        $state.go('people.person.badge', {xid: purchase_id});
      };

      $scope.addNewProduct = function(customer_id) {
          People.addNewProduct(customer_id)
                .then(function(people) {
                  $state.go('people.person.product',{xid: people.id});
                })
                .catch(function(error) {});
      };

      $scope.makeDonation = function(customer_id) {

        People.makeDonation(customer_id)
          .then(function(people) {
              $state.go('donation.product', {xid: people.id});
          })
          .catch(function(error) {});
      };

      $scope.empty = ($scope.query.needle.length > 0) && (people.length === 0);

      $scope.performSearch = function() {
        $state.go('people.search', { query: $scope.query.needle }, {reload: true});
      };

      $scope.validTickets = function(purchases) {
        return _.filter(purchases, function(purchase) {
          return purchase.has_valid_ticket;
        });


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

      $scope.returnedOnlyOneTicket = function(purchases) {
        if(_.size(purchases) == 1) {
          var customer_id = _.keys($scope.purchasesByAccount)[0];
          return $scope.validTickets(purchases[customer_id]).length == 1;
        } else {
          return false;
        }
      };

      if(_.size($scope.purchasesByAccount) == 1)
      {
        var customer_id = _.keys($scope.purchasesByAccount)[0];
        $scope.expand(customer_id);
        People.getOne($scope.purchasesByAccount[customer_id][0].id)
              .then(function(result) {
                  $scope.person = result;
        });
      } else {
        _.each($scope.purchasesByAccount, function(purchases) {
          $scope.collapse(purchases[0].customer_id);
        });
      }

/*
      if($scope.returnedOnlyOneTicket($scope.purchasesByAccount)) {
        var customer_id = _.keys($scope.purchasesByAccount)[0];
        $scope.expand(customer_id);

        People.getOne($scope.purchasesByAccount[customer_id][0].id)
                .then(function(result) {
                  $scope.person = result;
        });

      } else {
        _.each($scope.purchasesByAccount, function(purchases) {
          $scope.collapse(purchases[0].customer_id);
        });
      };*/

      $anchorScroll("#query-needle");
      $scope.focusInput();
    });
})();
