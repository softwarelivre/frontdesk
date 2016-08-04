(function() {
  'use strict';

  angular
    .module('templates', []);

  angular
    .module('segue.frontdesk',[
      'templates',
      'ui.router',
      'ui.router.compat',
      'ui.keypress',
      'ngToast',
      'restangular',
      'angular-loading-bar',
      'ui.bootstrap',
      'ngToast',
      'ngMask',
      'angularMoment',

      'segue.frontdesk.locale',
      'segue.frontdesk.humanized',
      'segue.frontdesk.errors',
      'segue.frontdesk.filters',
      'segue.frontdesk.directives',
      'segue.frontdesk.home',
      'segue.frontdesk.authenticate',
      'segue.frontdesk.people',
      'segue.frontdesk.printers',
      'segue.frontdesk.reports',
      'segue.frontdesk.speakers',
      'segue.frontdesk.purchase.service',
      'segue.frontdesk.visitors',
      'segue.frontdesk.donation'
    ])
    .controller('FrontDeskController', function($scope, $state, DeviceType, Auth, Printers, Config) {
      $scope.deviceClass = (DeviceType.isMobile())? 'mobile':'desktop';
      $scope.currentPrinter = Printers.getCurrent();

      $scope.$on('$stateChangeSuccess', function(event, newState) {
        $scope.topState = newState.name.split('.')[0];
        $scope.subState = $scope.topState + "-" + newState.name.split('.')[1];
        $scope.state    = newState;
      });
      $scope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
        console.log('error moving from', fromState, 'to', toState);
        console.log('toParams:', toParams);
        console.log('fromParams:', fromParams);
        console.log(error);
      });

      $scope.home = function() {
        $scope.enforceAuth();
        $state.go('home');
      };
      $scope.enforceAuth = function() {
        if (!Auth.credentials()) { $state.go('authenticate'); }
      };
      $scope.$on('auth:changed', $scope.enforceAuth);

      $scope.CONFIG = Config;

      $scope.goBack = function() {
        history.back();
      };

    })
    .config(function(RestangularProvider, Config) {
      RestangularProvider.setBaseUrl(Config.API_HOST + Config.API_PATH);
      RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
        if (operation == "getList") { return data.items; }
        if (data.resource) { return data.resource; }
        return data;
      });
      RestangularProvider.setOnElemRestangularized(function(thing, isCollection, model, Restangular) {
        if ((!isCollection) && (_.isObject(thing))) {
          thing.follow = function(name) {
            if (!thing.links) return null;
            if (!thing.links[name]) return null;
            var path = thing.links[name].href.replace(/.api./,'');
            return Restangular.one(path).getList();
          };
        }
        return thing;
      });
    })
    .config(function($urlRouterProvider) {
      $urlRouterProvider.otherwise('/');
    });

})();
