(function() {
  "use strict";

  angular
    .module('segue.frontdesk.printers', [ 'segue.frontdesk' ])
    .directive("printers", function(Printers) {
      return {
        templateUrl: 'modules/Printers/printers.html',
        controller: function($scope, Printers, Auth) {
          $scope.currentPrinter = Printers.glue($scope,'currentPrinter');
          $scope.setCurrent = Printers.setCurrent;

          function load() {
            if (!Auth.credentials()) {
              $scope.allPrinters = [];
            } else {
              Printers.allPrinters().then(function(printers) {
                $scope.allPrinters = printers;
              });
            }
          }
          load();

          $scope.$on('auth:changed', load);
        }
      };
    })
    .service('Printers', function($localStorage, $rootScope, Restangular, Config) {
      var printers = Restangular.service('fd/printers');
      var self = {};

      self.allPrinters = function() {
        return printers.getList();
      };

      self.getCurrent = function() {
        return $localStorage.currentPrinter || Config.DEFAULT_PRINTER;
      };

      self.setCurrent = function(value) {
        $localStorage.currentPrinter = value;
        $rootScope.$broadcast('printer:changed', value);
      };

      self.glue = function(target, varName) {
        $rootScope.$on('printer:changed', function(_,d) { target[varName] = d; });
        return self.getCurrent();
      };

      return self;
    });

})();
