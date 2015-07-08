(function() {
  "use strict";

  angular
    .module('segue.frontdesk.visitors', [
      'segue.frontdesk',
      'segue.frontdesk.printers',
      'restangular'
    ])
    .config(function($stateProvider) {
      $stateProvider
        .state('visitors', {
          url: '^/visitors',
          views: {
            "content@": { controller: 'VisitorController', templateUrl: 'modules/Visitors/visitors.html' }
          },
        });
    })
    .controller("VisitorController", function($scope, $state, FormErrors, Visitors, focusOn) {
      $scope.visitor = { name: '', email: '', document: '' };
      focusOn('name');

      $scope.focusEmail = _.partial(focusOn, 'email');
      $scope.focusDoc   = _.partial(focusOn, 'document');
      $scope.commit     = function() {
        Visitors.create($scope.visitor)
                .then($state.reload())
                .catch(FormErrors.set);
      };
    })
    .service('Visitors', function(Restangular, Printers) {
      var visitors = Restangular.service('fd/visitors');
      var self = {};

      self.create = function(data) {
        data.printer = Printers.getCurrent();
        return visitors.post(data);
      };

      return self;
    });

})();
