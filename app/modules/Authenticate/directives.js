(function() {
  "use strict";

  angular
    .module('segue.frontdesk.authenticate.directive',[
      'segue.frontdesk.authenticate.service'
    ])
    .directive("loggedAs", function(Auth) {
      return {
        templateUrl: 'modules/Authenticate/logged-as.html',
        controller: function($scope) {
          $scope.credentials = Auth.glue($scope,'credentials');
          $scope.logout  = Auth.logout;
        }
      };
    });
})();
