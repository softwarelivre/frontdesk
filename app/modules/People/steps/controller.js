(function() {
  "use strict";

  angular
    .module('segue.frontdesk.people.steps', [
      'segue.frontdesk.people.steps.controller',
      'segue.frontdesk.people.controller',
      'segue.frontdesk.people.service',

      'segue.frontdesk.authenticate.service',
      'ui.keypress',
    ])
    .config(function($stateProvider) {
      function viewsFor(stepName, customTemplateName) {
        var templateName = customTemplateName || stepName.toLowerCase();
        return {
          "header": { controller: 'Person'+stepName+'Controller', templateUrl: 'modules/People/person.header.html' },
          "data":   { controller: 'Person'+stepName+'Controller', templateUrl: 'modules/People/person.data.html' },
          "step":   { controller: 'Person'+stepName+'Controller', templateUrl: 'modules/People/steps/'+templateName+'.html' }
        };
      }
      function resolves(otherResolves) {
        var defaults = { person: function(People, $stateParams) { return People.getOne($stateParams.xid); } };
        return _.extend(defaults, otherResolves);
      }

      $stateProvider
        .state('people.person.name', {
          url: '/name',
          views: viewsFor('Name'),
          resolve: resolves({})
        })
        .state('people.person.document', {
          url: '/document',
          views: viewsFor('Document'),
          resolve: resolves({})
        })
        .state('people.person.country', {
          url: '/country',
          views: viewsFor('Country'),
          resolve: resolves({})
        })
        .state('people.person.city', {
          url: '/city',
          views: viewsFor('City'),
          resolve: resolves({})
        })
        .state('people.person.product', {
          url: '/product',
          views: viewsFor('Product'),
          resolve: resolves({
            products: function(person) { return person.follow('eligible'); }
          })
        });
    });

  angular
    .module('segue.frontdesk.people.steps.controller', [])

    .controller('PersonNameController', function($scope, $state, People, focusOn, person, lazyCommit) {
      $scope.step = { name: person.name };
      $scope.keypress = {
        enter: lazyCommit(People.patch, person.id, 'people.person.document', person, $scope, 'name')
      };
      focusOn('step.name');
    })
    .controller('PersonDocumentController', function($scope, $state, People, focusOn, person, lazyCommit) {
      $scope.step = { "document": person.document };
      $scope.keypress = {
        enter: lazyCommit(People.patch, person.id, 'people.person.country', person, $scope, 'document')
      };
      focusOn('step.document');
    })
    .controller('PersonCountryController', function($scope, $state, Config, People, focusOn, person, lazyCommit) {
      $scope.options = Config.DEFAULT_COUNTRIES;
      $scope.step = { country: person.country };
      $scope.commitCountry = lazyCommit(People.patch, person.id, 'people.person.city', person, $scope, 'country');

      $scope.selectOption = function(index) {
        var options = $scope.options.concat($scope.enteredOption);
        $scope.step.country = options[index];
        $scope.commitCountry();
      };

      $scope.keypress = function($index) {
        return {
          up:    _.partial($scope.focusOption, $scope.options.length, $index-1),
          down:  _.partial($scope.focusOption, $scope.options.length, $index+1),
          enter: _.partial($scope.selectOption, $index)
        };
      };

      $scope.autoFocusOption($scope.options, person.country);

    })
    .controller('PersonCityController', function($scope, $state, People, focusOn, person, lazyCommit) {
      $scope.step = { city: person.city };
      $scope.keypress = {
        enter: lazyCommit(People.patch, person.id, 'people.person.product', person, $scope, 'city')
      };
      focusOn('step.city');
    })
    .controller('PersonProductController', function($scope, $state, Config, People, focusOn, person, products, lazyCommit) {
      $scope.options = products;
      $scope.step = { product: person.product };
      $scope.commitProduct = lazyCommit(People.setProduct, person.id, 'people.person.payment', person, $scope, 'product');

      $scope.doNothing = function() {
        $state.go('people.person.payment');
      };

      $scope.selectOption = function(index) {
        $scope.step.product = options[index];
        $scope.commitProduct();
      };

      $scope.keypress = function($index) {
        return {
          up:    _.partial($scope.focusOption, $scope.options.length, $index-1),
          down:  _.partial($scope.focusOption, $scope.options.length, $index+1),
          enter: _.partial($scope.selectOption, $index)
        };
      };

      $scope.autoFocusOption($scope.options, person.product, function(x) { return x.id == person.product.id; });
    });

})();
