(function() {
  "use string";

  angular
    .module("segue.frontdesk.authenticate",[
      "segue.frontdesk",
      "segue.frontdesk.authenticate.directive",
      "segue.frontdesk.authenticate.controller",
      "segue.frontdesk.authenticate.service",
    ])
    .config(function($stateProvider) {
      $stateProvider
        .state('authenticate', {
          url: '^/authenticate',
          views: {
            "header": { templateUrl: 'modules/common/nav.html' },
            "main":   { controller: 'LoginController',  templateUrl: 'modules/Authenticate/login.html' },
          },
        });
    });

  angular
    .module("segue.frontdesk.authenticate.controller", [
      "segue.frontdesk.authenticate.service",
    ])
    .controller("LoginController", function($scope, $state, Auth, focusOn) {
      $scope.login = {};

      $scope.tryLogin = function() {
        Auth.login($scope.login.email, $scope.login.password).then($scope.home);
      };

      focusOn('login.email');
    });
})();
