(function() {
  "use strict";

  angular
    .module('segue.frontdesk.reports', [
      'segue.frontdesk',
      'restangular'
    ])
    .config(function($stateProvider) {
      $stateProvider
        .state('reports', {
          url: '^/reports',
          views: {
            "content@": { controller: 'ReportController', templateUrl: 'modules/Reports/reports.html' }
          },
          resolve: {
            report: function(Reports, $stateParams) { return Reports.forDay($stateParams.day); },
            cashier: function(Auth, $stateParams) { return Auth.credentials(); }
          }
        });
    })
    .controller("ReportController", function($scope, $state, report, cashier) {
      $scope.query = {
        day:   $state.params.day,
        start: $state.params.start,
        end:   $state.params.end
      };

      $scope.report = report;
      $scope.cashier = cashier;
      $scope.issueTime = new Date();

      function periodFilter(payment) {
        var date = new Date(payment.created);
        var afterStartHour = !$scope.query.start || parseInt($scope.query.start) <= date.getHours();
        var beforeEndHour  = !$scope.query.end   || parseInt($scope.query.end)   >= date.getHours();

        return afterStartHour && beforeEndHour;
      }
      function summer(a,b) { return a + b; }

      $scope.updateFilter = function() {
        $scope.filtered = _.filter(report, periodFilter);
        var isCash = function(p) { return _.filter(p.transitions,'mode','cash').length; };
        var isCard = function(p) { return _.filter(p.transitions,'mode','card').length; };
        $scope.totalSum = _.chain($scope.filtered).pluck('amount').map(parseFloat).reduce(summer, 0);
        $scope.cashSum  = _.chain($scope.filtered).filter(isCash).pluck('amount').map(parseFloat).reduce(summer, 0);
        $scope.cardSum  = _.chain($scope.filtered).filter(isCard).pluck('amount').map(parseFloat).reduce(summer, 0);
      };

      $scope.updateFilter();

    })
    .service('Reports', function(Restangular) {
      var reports = Restangular.service('fd/reports');
      var self = {};

      self.forDay = function(day) {
        return reports.getList();
      };

      return self;
    });

})();
