(function() {
  "use strict";

  angular
    .module("segue.frontdesk.authenticate.service", [
      'segue.frontdesk',
      'http-auth-interceptor',
      'ngStorage',
      'restangular'
    ])
    .factory('authTokenInterceptor', function($window, Config, LocalSession) {
      return {
        request: function (config) {
          if (!config.url.match(Config.API_HOST)) { return config; }
          config.headers = config.headers || {};
          config.headers.Authorization = 'Bearer '+ LocalSession.current().token;
          return config;
        }
      };
    })
    .config(function ($httpProvider) {
      $httpProvider.interceptors.push('authTokenInterceptor');
    })
    .service("LocalSession", function($localStorage, $rootScope) {
      var self = {};

      self.create = function(data) {
        $localStorage.session = { token: data.token, credentials: data.credentials };
        $rootScope.$broadcast('auth:changed', data.credentials);
        return data.credentials;
      };

      self.current = function(data) {
        return $localStorage.session || {};
      };

      self.destroy = function() {
        delete $localStorage.session;
        $rootScope.$broadcast('auth:changed', null);
      };

      return self;
    })
    .service("Auth", function(Restangular, LocalSession, $sce, $rootScope, $state, ngToast) {
      var session = Restangular.service('sessions');

      <!--TODO: MOVE TO app.js -->
      Restangular.setErrorInterceptor(function(response, deferred, responseHandler) {
        if (response.status === 400) {

          <!-- TODO: REMOVE THIS HACK -->
          if(response.data.description == 'Token is undecipherable' && response.data.error == 'Invalid JWT')
          {
            LocalSession.destroy();
            $state.go('splash');
          }
          else
          {
            var str_error_message = '<span translate>' + response.data.error.message + '</span>';
            ngToast.create({
              content: $sce.trustAsHtml(str_error_message),
              className: 'danger',
              compileContent: true
            });
          }
          return false;
        }
        if (response.status === 403) {

            var str_error_message = '<span translate>Não permitido</span>';
            ngToast.create({
              content: $sce.trustAsHtml(str_error_message),
              className: 'danger',
              compileContent: true
            });
        }
        return true;
      });

      self.logout = function() {
        LocalSession.destroy();
      };

      self.logoutAndSplash = function() {
        self.logout();
        $state.go('splash');
      }

      self.login = function(email, password) {
        LocalSession.destroy();
        return session.post({ email: email, password: password })
                      .then(LocalSession.create);
      };
      self.credentials = function() {
        return LocalSession.current().credentials;
      };
      self.token = function() {
        return LocalSession.current().token;
      };

      self.isCashier = function() {
        var credentials = self.credentials();
        if (!credentials) { return false; }
        return self.hasRole(credentials, 'cashier') || self.hasRole(credentials, 'admin')
      };

      self.hasRole = function(account, role) {
        if (!account) { return false;}
        return account.role == role;
        /*
        for(var i=0; i < account.roles.length; i++) {
          if(account.roles[i].name === role) { return true; }
        }
        return false;
        */
      }


      self.glue = function(target, name) {
        $rootScope.$on('auth:changed', function(_,d) { target[name] = d; });
        return self.credentials();
      };

      return self;
    });

})();
