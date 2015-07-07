(function() {
  "use strict";

  angular
    .module('segue.frontdesk')
    .constant('Config', {
      API_HOST: 'http://192.168.33.91',
      API_PATH: '/api',
      DEFAULT_COUNTRIES: ['Brasil','Argentina','Uruguai'],
      TIMEZONE: '-0300',
      DEFAULT_PRINTER: 'vagrant',
      EVENT_DAYS: ["2015-07-08","2015-07-09","2015-07-10","2015-07-11"]
    });

})();
