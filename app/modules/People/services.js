(function() {
  "use strict";

  angular
    .module('segue.frontdesk.people.service', [ ])
    .service('People', function(Restangular) {
      var self = {};
      var people = Restangular.service('fd/people');

      self.lookup = function(query) {
        if (!query.needle) { return []; }
        return people.getList({ q: query.needle });
      };

      return self;
    });
})();
