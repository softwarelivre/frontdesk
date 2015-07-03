(function() {
  "use strict";

  angular
    .module("segue.frontdesk.directives", [ 'segue.frontdesk' ])
    .directive("focusable", function($timeout) {
      return function(scope, elem, attr) {
        var myName = attr.focusable || scope.$parent.focusLabel || attr.ngModel;
        scope.$on('focus-on', function(e, name) {
          if(name === myName) {
            $timeout(function() {
              elem[0].focus();
            });
          }
        });
      };
    })
    .factory('focusOn', function ($rootScope, $timeout) {
      return function(name, timeout) {
        $timeout(function (){
          $rootScope.$broadcast('focus-on', name);
        }, timeout || 100);
      };
    })
    .directive("fixedHorizontal", function($window) {
      return function(scope, element, attrs) {
        angular.element(element).css('position', 'absolute');
        angular.element($window).bind("scroll", function(e) {
          angular.element(element).css('left', $window.scrollX + "px");
        });
      };
    })
    .directive("fixedVertical", function($window) {
      return function(scope, element, attrs) {
        angular.element(element).css('position', 'absolute');
        angular.element($window).bind("scroll", function(e) {
          angular.element(element).css('top', $window.scrollY + "px");
        });
      };
    });
})();
