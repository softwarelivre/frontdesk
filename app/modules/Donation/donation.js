(function() {
  "use strict";

  angular
    .module('segue.frontdesk.donation', [
      'segue.frontdesk',
      'segue.frontdesk.printers',
      'restangular'
    ])
    .config(function($stateProvider) {
      $stateProvider
        .state('donation', {
          abstract: true,
          url: '^/donation/:xid',
          views: {
            header: { controller: "DonationController", templateUrl: 'modules/common/nav.html' }
          },
          resolve: {
            products: function(People, $stateParams) { return People.getDonationProducts($stateParams.xid); },
            person: function(People, $stateParams) { return People.getOne($stateParams.xid); }
          }
        })
        .state('donation.product', {
          url: '/product',
          views: {
            "main@": { controller: 'DonationProductController', templateUrl: 'modules/Donation/product.html' }
          },
        })
        .state('donation.payment', {
          url: '/payment',
          views:  {
            "main@": { controller: 'DonationPaymentController', templateUrl: 'modules/Donation/payment.html' }
          },
        })
        .state('donation.done', {
          url: '/done',
          views: {
            "main@": { controller: 'DonationDoneController', templateUrl: 'modules/Donation/done.html'}
          },
        })
    })
    .controller("DonationController", function($scope, $state, $stateParams) {
    })
    .controller("DonationProductController", function($scope, $state, $stateParams, $uibModal,
                                                      FormErrors, People, Auth, Donations,
                                                      products, person, focusOn) {
      $scope.is_cashier = Auth.isCashier();
      $scope.person = person;
      $scope.amount = 10;
      $scope.selectedProduct = undefined;
      $scope.isCorporate = People.isCorporate($scope.person);

      $scope.options = products.filter(function(product) {
        if(product.category == 'donation'){return true;}
        else{return false;}
      });

      $scope.selectOption = function(index) {
        /*just once*/
        if(!$scope.selectedProduct)
        {
          $scope.selectedProduct = $scope.options[index];
          if($scope.selectedProduct.price == 0 ) {
            showProductOptions(onSubmit);
          } else {
            onSubmit();
          }
        }
      };

      $scope.cancelDonation = function() {
        $state.go('people.search', { query: $scope.person.name });
      };

      function onSubmit() {
          People.setDonationProduct($scope.person.id, $scope.selectedProduct.id, $scope.amount)
              .then(nextState)
              .catch(function(error) {});
      };

      function showProductOptions(action) {

        var modalInstance = $uibModal.open({
          animation: false,
          templateUrl: 'modules/Donation/product_options.html',
          controller: 'DonationProductOptionsController',
          size: 'md'
        });

        modalInstance.result.then(function (result) {
          $scope.amount = result.amount;
          action();
        }, function() {
          /*dismissed*/
           $scope.selectedProduct = undefined;
        });
      };

      function nextState() {
        $state.go('donation.payment', null, { reload: true });
      }

    })
    .controller('DonationProductOptionsController', function($scope, $state, $uibModalInstance, focusOn) {

        $scope.donationOpts = {
          amount: 10
        }

        $scope.keypress = function(event) {
          switch(event.key) {
            case 'Enter': onClose();
          }
        };

        function onClose() {
            $uibModalInstance.close($scope.donationOpts);
        }

        /*TODO: THERE IS AN ISSUE WITH FOCUS ON*/
        setTimeout(focusOnAmountInput, 250);

        function focusOnAmountInput() {
          focusOn('donation.amount');
        }

    })
    .controller('DonationPaymentController', function($scope, $state, Auth, FormErrors, People, person){

      $scope.is_cashier = Auth.isCashier();
      $scope.person = person;

      $scope.didNotReceive = function() {
        $state.go('people.search', { query: person.name });
      };

      $scope.receivedCash = function() {
        People.receivedDonationPayment(person.id, 'cash')
              .then(onReceivePayment)
              .catch(FormErrors.set);
      };
      $scope.receivedCard = function() {
        People.receivedDonationPayment(person.id, 'card')
              .then(onReceivePayment)
              .catch(FormErrors.set);
      };
      function onReceivePayment(payment) {
        $state.go('donation.done');
      };

    })
    .controller('DonationDoneController', function($scope, $state, $timeout, person){
      $timeout(function() {
        $state.go('people.search', {query: person.id });
      },1500);
    })
    .service('Donations', function(Restangular, Printers) {
      var visitors = Restangular.service('fd/donations');
      var self = {};

      self.create = function(data) {

      };

      return self;
    });

})();
