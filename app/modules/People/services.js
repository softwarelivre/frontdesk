(function() {
  "use strict";

  angular
    .module('segue.frontdesk.people.service', [ ])
    .service('People', function(Restangular) {
      var self = {};
      var people = Restangular.service('fd/people');

      self.createPerson = function(data) {
        return people.post(data);
      };

      self.lookup = function(query) {
        if (!query.needle) { return []; }
        return people.getList({ q: query.needle });
      };

      self.getOne = function(xid) {
        if (!xid) { return ; }
        return people.one(xid).get();
      };

      self.patch = function(xid, data) {
        return people.one(xid).patch(data);
      };

      self.setProduct = function(xid, data) {
        return people.one(xid).post('product', data);
      };

      return self;
    })
    .factory('lazyCommit', function(FormErrors) {
      return function(commitFn, xid, nextState, oldEntry, scope, field) {
        return function() {
          console.log(scope.step[field], oldEntry[field]);
          if (scope.step[field] === oldEntry[field]) {
            console.log('no changes for field '+field+', so I will be lazy');
            scope.fastForward(nextState);
          }
          else {
            console.log('commiting changes on', field);
            commitFn(xid, scope.step).then(function() { scope.reload(nextState); })
                                     .catch(FormErrors.set);
          }
        };
      };
    });
})();
