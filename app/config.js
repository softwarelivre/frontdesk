(function() {
  "use strict";

  angular
    .module('segue.frontdesk')
    .constant('Config', {
      API_HOST: 'http://192.168.33.91',
      API_PATH: '/api',
      TIMEZONE: '-0300',
    });

})();
