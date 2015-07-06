(function() {
  "use strict";

  angular
    .module('segue.frontdesk.printers', [ 'segue.frontdesk' ])
    .directive("printers", function(Printers) {
      return {
        templateUrl: 'modules/Printers/printers.html',
        controller: function($scope, Printers) {
          $scope.currentPrinter = Printers.glue($scope,'currentPrinter');

          Printers.allPrinters().then(function(printers) {
            $scope.allPrinters = printers;
          });

          $scope.setCurrent = Printers.setCurrent;
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
