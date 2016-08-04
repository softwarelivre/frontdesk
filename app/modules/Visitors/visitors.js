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
            header: {                               templateUrl: 'modules/common/nav.html' },
            main: { controller: 'VisitorController', templateUrl: 'modules/Visitors/visitors.html' }
          },
        });
    })
    .controller("VisitorController", function($scope, $state, FormErrors, Visitors, focusOn) {
      $scope.visitor = { name: '', email: '', document: '' };
      focusOn('name');

      $scope.keypress = function(event) {
        switch(event.key) {
          case 'Enter': commit(); break;
        };
      }

      function commit() {
        Visitors.create($scope.visitor)
                .then($state.reload())
                .catch(FormErrors.setError);
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
