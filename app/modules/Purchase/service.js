(function() {
  "use strict";

  angular
    .module('segue.frontdesk.purchase.service',[
      'segue.frontdesk',
      'restangular',
      'ngStorage',
    ])
    .factory('Promocodes', function(Restangular, Auth) {
      var service = Restangular.service('promocodes');
      var extensions = {};

      extensions.getOwnedBy = function(xid) {
        return service.getList({ purchase_id: xid });
      };

      return _.extend(service, extensions);
    });

})();