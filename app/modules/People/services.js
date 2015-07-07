(function() {
  "use strict";

  angular
    .module('segue.frontdesk.people.service', [
      'segue.frontdesk.printers'
    ])
    .service('People', function(Restangular, Printers) {
      var self = {};
      var people = Restangular.service('fd/people');
      var badges = Restangular.service('fd/badges');

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

      self.setProduct = function(xid, step) {
        return people.one(xid).post('product', { product_id: step.product.id });
      };

      self.printBadge = function(xid) {
        return people.one(xid).post('badge', { printer: Printers.getCurrent() });
      };
      self.giveBadge = function(badgeId) {
        return badges.one(badgeId).post('give');
      };

      self.receivedPayment = function(xid, mode) {
        return people.one(xid).post('pay', { mode: mode });
      };

      return self;
    })
    .factory('lazyCommit', function(FormErrors) {
      return function(commitFn, xid, nextState, oldEntry, scope, field) {
        return function() {
          console.log(oldEntry[field], "--->", scope.step[field]);
          if ((scope.step[field]) && (scope.step[field] === oldEntry[field])) {
            console.log('no changes for field '+field+', so I will be lazy');
            scope.fastForward(nextState);
          }
          else {
            console.log('commiting changes on', field);
            commitFn(xid, scope.step).then(function(person) { scope.reload(nextState, person); })
                                     .catch(FormErrors.set);
          }
        };
      };
    });
})();
