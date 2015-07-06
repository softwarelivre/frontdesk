angular
  .module('segue.frontdesk.flash', [ ])
  .service('Flash', function() {
    var message = null;

    this.set = function(value) {
      message = value;
    };
    this.read = function() {
      var result = message;
      message = null;
      return result;
    };
  });
