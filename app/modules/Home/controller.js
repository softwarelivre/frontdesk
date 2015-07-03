(function() {
  "use strict";

  angular
    .module('segue.frontdesk.home', [
      'segue.frontdesk.authenticate.service',
      'segue.frontdesk.home.controller'
    ])
    .config(function($stateProvider) {
      $stateProvider
        .state('home', {
          url: '^/',
          views: {
            header: {                               templateUrl: 'modules/common/nav.html' },
            main:   { controller: 'HomeController', templateUrl: 'modules/Home/home.html' }
          }
        });
    });

  angular
    .module('segue.frontdesk.home.controller', [])
    .controller('HomeController', function($rootScope, $scope, $state, $window, Auth) {
      $scope.enforceAuth();
    });
})();
