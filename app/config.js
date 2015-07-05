(function() {
  "use strict";

  angular
    .module('segue.frontdesk')
    .constant('Config', {
      API_HOST: 'http://192.168.33.91',
      API_PATH: '/api',
      DEFAULT_COUNTRIES: ['Brasil','Argentina','Uruguai'],
      TIMEZONE: '-0300',
    });

})();
