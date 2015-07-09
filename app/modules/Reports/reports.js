(function() {
  "use strict";

  angular
    .module('segue.frontdesk.reports', [
      'segue.frontdesk.directives',
      'restangular'
    ])
    .config(function($stateProvider) {
      $stateProvider
        .state('reports', {
          url: '^/reports/:date',
          views: {
            "content@": { controller: 'ReportController', templateUrl: 'modules/Reports/reports.html' }
          },
          resolve: {
            report: function(Reports, $stateParams) { return Reports.forDay($stateParams.date); },
            cashier: function(Auth, $stateParams) { return Auth.credentials(); }
          }
        });
    })
    .controller("ReportController", function($scope, $state, Config, report, cashier, focusOn) {
      function putTimezone(date, customHour) {
        var hour = (customHour)? ' '+customHour : "T00:00:00";
        if (date.length > 10) { hour = ''; }
        var full = date + hour + Config.TIMEZONE;
        return full;
      }
      function hoursAndMinutes(datetime) {
        return datetime.getHours() + ":" + datetime.getMinutes();
      }

      $scope.query = {
        date:  putTimezone($state.params.date),
        start: '00:00',
        end:   hoursAndMinutes(new Date())
      };

      $scope.report = report;
      $scope.cashier = cashier;
      $scope.issueTime = new Date();

      function periodFilter(payment) {
        var paymentTime = Date.parse(putTimezone(payment.created));
        var startTime   = Date.parse(putTimezone($state.params.date, $scope.query.start));
        var endTime     = Date.parse(putTimezone($state.params.date, $scope.query.end));
        return (paymentTime >= startTime) && (paymentTime <= endTime);
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
      focusOn("query.start");

    })
    .service('Reports', function(Restangular) {
      var reports = Restangular.service('fd/reports');
      var self = {};

      self.forDay = function(day) {
        return reports.one(day).getList();
      };

      return self;
    });

})();
