(function() {
"use strict";

  angular
    .module('segue.frontdesk.printer', [
      'ngStorage',
      'restangular'
    ])
    .service('Printers', function($localStorage, Restangular, Config) {
      var printers = Restangular.service('fd/printers');
      var service = {};

      service.available = function() {
        return printers.getList();
      };

      service.getCurrent = function() {
        return $localStorage.currentPrinter || Config.DEFAULT_PRINTER;
      };
      service.setCurrent = function(value) {
        $localStorage.currentPrinter = value;
      };

      return service;
    });
})();
