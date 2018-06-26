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

      self.patchInfo = function(xid, data) {
        return people.one(xid).one('patch_info').patch(data);
      }

      self.patchAddress = function(xid, data) {
        return people.one(xid).one('patch_address').patch(data);
      }

      self.patchBadge = function(xid, badge) {
        return people.one(xid).one('badge').patch(badge);
      }

      self.setProduct = function(xid, step) {
        return people.one(xid).post('product', { product_id: step.product.id });
      };

      /* TODO: REMOVE */
      self.setPersonProduct = function(xid, product, qty) {
        return people.one(xid).post('product', { product_id: product.id, qty: qty });
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

      self.applyPromo = function(xid, data) {
        return people.one(xid).post('promo', data);
      };

      self.getEmployeer = function(xid) {
        return people.one(xid).one('employeer').get();
      }

      self.createEmployee = function (xid, data) {
         return people.one(xid).one('employees').post('add', data);
      };

      self.getEmployees = function (xid) {
         return people.one(xid).one('employees').getList();
      };

      self.addNewProduct = function(purchase_id) {
        return people.one(purchase_id).post('add_product');
      }

      self.getProducts = function(person_id) {
        return people.one(person_id).one('eligible').getList();
      }

      self.getDonationProducts = function(person_id) {
        return people.one(person_id).one('donation').one('eligible').getList();
      }

      self.setDonationProduct = function(xid, product_id, amount) {
        var params = {
          product_id: product_id,
          amount: amount
        }
        return people.one(xid).one('donation').post('change', params);
      };

      self.makeDonation = function(purchase_id) {
        return people.one(purchase_id).one('donation').post('new');
      }

      self.receivedDonationPayment = function(xid, mode) {
        return people.one(xid).one('pay').post('donation', { mode: mode });
      };

      self.isUser = function(account) {
        return self.hasRole(account, 'user');
      };

      self.isAdmin = function(account) {
        return self.hasRole(account, 'admin');
      };

      self.isForeign = function(account) {
        return self.hasRole(account, 'foreign');
      };

      self.isCorporate = function(account) {
        return self.hasRole(account, 'corporate');
      }

      self.hasRole = function(account, role) {
        if (!account) { return false;}
        return account.role == role;
      }

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
            commitFn(xid, scope.step).then(function(person) { scope.reload(nextState); })
                                     .catch(FormErrors.set);
          }
        };
      };
    })
    .factory('lazyPost', function(FormErrors) {
      return function(commitFn, xid, nextState, form, scope) {
        return function() {
          if (!form.$dirty) {
            console.log('no changes, so it will be lazy');
            scope.fastForward(nextState);
          }
          else {
            console.log('submitting changes');
            commitFn(xid, scope.step).then(function(person) { scope.reload(nextState); })
                                     .catch(FormErrors.set);
          }
        };
      };
    });
})();
