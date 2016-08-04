(function() {
  "use strict";

  angular
    .module('segue.frontdesk.speakers', [
      'segue.frontdesk',
      'segue.frontdesk.printers',
      'restangular'
    ])
    .config(function($stateProvider) {
      $stateProvider
        .state('speakers', {
          url: '^/speakers',
          views: {
            header: {                               templateUrl: 'modules/common/nav.html' },
            main: { controller: 'SpeakerController', templateUrl: 'modules/Speakers/speakers.html' }
          },
        });
    })
    .controller('SpeakerController', function($scope, $state, FormErrors, Speakers, focusOn) {
      $scope.speaker = { 
        ticket: 'speaker' 
      };

      $scope.keypress = function(event) {
        switch(event.key) {
          case 'Enter': $scope.submit(); break;
        };
      }

      $scope.submit = function() {
        Speakers.create($scope.speaker)
                .then(onSubmit)
                .catch(FormErrors.setError);
      };

      function onSubmit(person) {
        $state.reload();
      };

      focusOn('speaker.ticket');

    })
    .service('Speakers', function(Restangular, Printers) {
      var speakers = Restangular.service('fd/speakers');
      var self = {};

      self.create = function(data) {
        data.printer = Printers.getCurrent();
        return speakers.post(data);
      };

      return self;
    });

})();
