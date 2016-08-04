(function() {
  "use strict";

  angular
    .module('segue.frontdesk')
    .constant('Config', {
      API_HOST: 'http://segue-api.dev.softwarelivre.org',
      API_PATH: '/api',
      GOOGLE_GEO_API: 'http://maps.googleapis.com/maps/api/geocode/json',
      DEFAULT_COUNTRIES: ['Brasil','Argentina','Uruguai'],
      TIMEZONE: '-0300',
      DEFAULT_PRINTER: 'vagrant',
      EVENT_DAYS: ["2016-06-13","2016-07-14","2016-07-15","2016-07-16"]
    });

})();
