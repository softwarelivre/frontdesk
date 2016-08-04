(function() {
  "use strict";

  angular
    .module('segue.frontdesk.people.steps', [
      'segue.frontdesk.flash',
      'segue.frontdesk.people.steps.controller',
      'segue.frontdesk.people.controller',
      'segue.frontdesk.people.service',

      'segue.frontdesk.authenticate.service',
      'ui.keypress',
    ])
    .config(function($stateProvider) {
      function viewsFor(stepName, customTemplateName) {
        var templateName = customTemplateName || stepName.toLowerCase();
        return {
          "header": { controller: 'PersonBasicInfoController', templateUrl: 'modules/People/person.header.html' },
          "data":   { controller: 'PersonBasicInfoController', templateUrl: 'modules/People/person.data.html' },
          "step":   { controller: 'Person'+stepName+'Controller', templateUrl: 'modules/People/steps/'+templateName+'.html' }
        };
      }
      function resolves(otherResolves) {
        var defaults = {};
        return _.extend(defaults, otherResolves);
      }

      $stateProvider
        .state('people.person.basicinfo', {
          url: '/basicinfo',
          views: viewsFor('BasicInfo', 'basic_info'),
          resolve: resolves({})
        })
        .state('people.person.address', {
          url: '/address',
          views: viewsFor('Address'),
          resolve: resolves({})
        })
        .state('people.person.product', {
          url: '/product',
          views: viewsFor('Product'),
          resolve: resolves({ products: function(person) { return person.follow('eligible'); } })
        })
        .state('people.person.promocode', {
          url: '/promocode',
          views: viewsFor('Promocode'),
          resolve: resolves({})
        })
        .state('people.person.payment', {
          url: '/payment',
          views: viewsFor('Payment'),
          resolve: resolves({})
        })
        .state('people.person.badge', {
          url: '/badge',
          views: viewsFor('Badge'),
          resolve: resolves({})
        })
        .state('people.person.print', {
          url: '/print-badge',
          views: viewsFor('Print'),
          resolve: resolves({})
        })
        .state('people.person.give_badge', {
          url: '/give-badge',
          views: viewsFor('GiveBadge', 'give_badge'),
          resolve: resolves({})
        })
        .state('people.person.corporate', {
          url: '/corporate',
          views: viewsFor('Corporate'),
          resolve: resolves({
            employees: function(People, $stateParams) { return People.getEmployees($stateParams.xid);},
            promocodes: function(Promocodes,$stateParams) { return Promocodes.getOwnedBy($stateParams.xid)}
          })
        })
        .state('people.person.done', {
          url: '/done',
          views: viewsFor('Done'),
          resolve: resolves({})
        })
    });

  angular
    .module('segue.frontdesk.people.steps.controller', [])
    .controller('PersonBasicInfoController', function($scope, $state, People, person, focusOn, lazyCommit, FormErrors) {

      if(People.isCorporate(person)) {
        $scope.person.type = 'corporate';
        $scope.person.cnpj = $scope.person.document;
      } else if(People.isForeign(person)) {
        $scope.person.type = 'foreign';
        $scope.person.passport = $scope.person.document;
      } else {
        $scope.person.type = 'person';
        $scope.person.cpf = $scope.person.document;
      }

      $scope.is_cashier = ''
      $scope.isCorporate = People.isCorporate(person);

      $scope.keypress = function(event) {
          console.log('ke');
          switch(event.key) {
            case 'Enter':
              if( !$scope.person.id ) {
                People.createPerson($scope.person)
                        .then(nextState)
                        .catch(FormErrors.setError);
              } else {
                People.patchInfo($scope.person.id, $scope.person)
                        .then(nextState)
                        .catch(FormErrors.setError);
              }
          };
      }

      function nextState(result) {
        $state.go('people.person.address');
      };

      focusOn('person.name');

    })
    .controller('PersonAddressController', function($scope, $state, Config, People, focusOn, lazyPost, AddressResolver, FormErrors) {

      $scope.selectedAddress = '';

      $scope.onFinish = function() {
          People.patchAddress($scope.person.id, $scope.person)
                .then(nextState)
                .catch(FormErrors.setError);
      };

      $scope.keypress = function(event) {
        switch(event.key) {
          case 'Enter': $scope.onFinish(); break;
        };
      };

      $scope.getLocation = function(address) {
        return AddressResolver.fetchLocation(address).then(function(results){
            return results.map(function(item){
                return item;
            });
        });
      };

      $scope.onSelectLocation = function($item){
        var address = AddressResolver.convertToAddress($item);
        $scope.person.country = address.country;
        $scope.person.address_state = address.state;
        $scope.person.city = address.city;
        $scope.person.address_zipcode = address.zipcode;
        $scope.person.address_neighborhood = address.neighborhood;
        $scope.person.address_street = address.street;
        /*TODO: FIX */
        $scope.person.address_extra = '';

        focusOnMissingAddressField([
          'country','address_zipcode','address_state','city',
          'address_neighborhood','address_street', 'address_number','address_extra'
        ]);
      };


      function focusOnMissingAddressField(fields) {
        for(var i=0; i<fields.length; i++)
        {
          if(!$scope.person[fields[i]]) {
            focusOn('person.'+fields[i]);
            return;
          }
        }
      };

      function nextState(response) {
        $state.go('people.person.product', $scope.person.id);
      }
      focusOn('selectedAddress');

    })
    .controller('PersonProductController', function($scope, $state, Auth, Config, People, focusOn, person, products, lazyCommit) {
      $scope.is_cashier = Auth.isCashier();
      $scope.qty = 1;

      $scope.options = _.filter(products, function(product) {
        if(People.isCorporate(person))
          return (product.category == 'business' || product.category == 'government');
        else if(People.isForeign(person))
          return (product.category == 'foreigner');
        else
          return (product.category == 'normal' || product.category == 'student');
      });


      $scope.commitProduct = lazyCommit(People.setProduct, person.id, 'people.person.payment', person, $scope, 'product');


      $scope.backToSearch  = function() { $scope.reload('people.person.done'); };
      $scope.goToPayment   = function() { $scope.reload('people.person.payment'); };
      $scope.goToPromocode = function() { $scope.reload('people.person.promocode'); };

      $scope.selectOption = function(index) {
        if (index == $scope.options.length) {
          $scope.goToPromocode();
        } else {
          var product = $scope.options[index];

          People.setPersonProduct(person.id, product, $scope.qty)
              .then(function(result) {
                $state.go('people.person.payment', {}, {reload: true});
              })
              .catch(function(error) {});
        }
      };

      $scope.keypress = function($index) {
        return {
          up:    _.partial($scope.focusOption, $scope.options.length+1, $index-1),
          down:  _.partial($scope.focusOption, $scope.options.length+1, $index+1),
        };
      };

      $scope.autoFocusOption($scope.options, person.product, function(x) { return x.id == person.product.id; });
    })
    .controller('PersonPromocodeController', function($scope, $state, People, FormErrors, focusOn) {
      $scope.step = { hash_code: '' };
      $scope.tryPromocode = function() {
        People.applyPromo($scope.person.id, $scope.step)
              .then($scope.restart)
              .catch(FormErrors.set);
      };
      $scope.giveUp = $scope.restart;
      $scope.keypress = function(event) {
        switch(event.key) {
          case 'Enter': $scope.tryPromocode(); break;
          case 'Esc': $scope.giveUp(); break;
        }
      }

      focusOn('step.hash_code');
    })
    .controller('PersonCorporateController', function($scope, $state, $uibModal, People, employees,promocodes, ngToast) {
      $scope.employees = employees;
      $scope.promocodes = promocodes;

      People.getEmployeer($scope.person.customer_id).then(function(employeer) {
        $scope.employeer = employeer;
      });

      $scope.viewEmployee = function(employee) {
        $state.go('people.person.badge', {xid: employee.purchase_id },  { reload: true });
      };

      $scope.registerEmployee = function(promocode) {

          var modalInstance = $uibModal.open({
                  animation: false,
                  templateUrl: 'modules/People/steps/employee.html',
                  controller: 'PersonNewEmployeeController',
                  size: 'md',
                  resolve: {
                    employeer: function () {
                      return $scope.person;
                    },
                    promocode: function() {
                      return promocode;
                    }
                  }
          });

          modalInstance.result.then(function (result) {
               $state.reload();
          });
      }

      $scope.editBadge = function(employee) {
        $state.go('people.person.badge', {xid: employee.purchase_id}, {reload: true});
      };

      $scope.giveBadge = function(employee) {
        People.giveBadge(employee.last_badge.id)
              .then(function(result) {
                  //$scope.performSearch();
              }).catch();
      };

      $scope.printBadge = function(employee) {
        People.printBadge(employee.purchase_id)
              .then(function(response) {
                ngToast.create({
                  content: 'Crachá enviado para a impressão.',
                  PurclassName: 'success',
                });
              })
              .catch(function(error) {
                  ngToast.create({
                    content:'Houve um na hora de imprimir.',
                    PurclassName: 'danger',
                  });
              });
      };
    })
    .controller('PersonNewEmployeeController', function($scope, $state, $uibModalInstance, focusOn, FormErrors, People, employeer, promocode) {
      $scope.employee = {
        phone: employeer.phone,
        promo_hash: promocode.hash_code,
        country: employeer.country,
        city: employeer.city,
        address_state: employeer.address_state,
        address_zipcode: employeer.address_zipcode,
        address_street: employeer.address_street,
        address_neighborhood: employeer.address_neighborhood,
        address_number: employeer.address_number,
        address_extra : '',
      };
      /*HACK*/
     // if(_.isString(employeer.address_extra)){
     //   $scope.employee = employeer.address_extra;
     // }

      $scope.keypress = function(event) {
        switch(event.key) {
          case 'Enter': $scope.createEmployee(); break;
        };
      };

      $scope.createEmployee = function() {
          People.createEmployee(employeer.id, $scope.employee)
                .then(onCreate)
                .catch(FormErrors.setError);
      };

      function onCreate(person) {
        $uibModalInstance.close();
      }

      focusOn('employee.name');

    })
    .controller('PersonPaymentController', function($scope, $state, Auth, People, FormErrors, focusOn, lazyCommit) {
      $scope.is_cashier = Auth.isCashier();
      if ($scope.person.has_valid_ticket && !$scope.person.has_payable_ticket) { $scope.restart(); }

      $scope.didNotReceive = function() {
        $state.go('people.search', { query: $scope.person.name });
      };

      $scope.didNotReceiveStudentDocument = function() {
        $state.go('people.search', { query: $scope.person.name });
      };

      $scope.receivedCash = function() {
        People.receivedPayment($scope.person.id, 'cash')
              .then(onReceivePayment)
              .catch(FormErrors.set);
      };
      $scope.receivedCard = function() {
        People.receivedPayment($scopeperson.id, 'card')
              .then(onReceivePayment)
              .catch(FormErrors.set);
      };

      $scope.goToPromocode = function() { $scope.reload('people.person.promocode'); };

      $scope.keypress = function($index) {
        return {
          up:    _.partial($scope.focusOption, 4, $index-1),
          down:  _.partial($scope.focusOption, 4, $index+1),
        };
      };

      function onReceivePayment(payment) {
        if(People.isCorporate($scope.person)) {
          $state.go('people.person.corporate', { xid: $scope.person.id}, {reload: true});
        }
        else {
          $state.go('people.person.badge', {xid: $scope.person.id}, {reload: true});
        }
      }

      focusOn('option-0');
    })
    .controller('PersonBadgeController', function($scope, $state, People, FormErrors, focusOn, lazyCommit) {
      if (!$scope.person.has_valid_ticket) { $scope.restart(); return; }

      $scope.badge = {
        badge_name: $scope.person.badge_name,
        badge_corp: ''
      };

      if(_.isString($scope.person.badge_corp))
      {
        $scope.badge.badge_corp = $scope.person.badge_corp;
      }


      $scope.keypress = function(event) {
        switch(event.key) {
          case 'Enter': $scope.submit();
        }
      }

      $scope.submit = function() {
        People.patchBadge($scope.person.id, $scope.badge)
              .then(nextState)
              .catch(FormErrors.setError)
      };

      function nextState() {
        $state.go('people.person.give_badge')
      }

      if($scope.badge.badge_corp.length > 1 ) {
        focusOn('badge.badge_corp');
      } else {
        focusOn('badge.badge_name');
      }

    })
    .controller('PersonPrintController', function($scope, $state, People, Flash, focusOn) {
      if (!$scope.person.has_valid_ticket) { $scope.restart(); return; }

      function nextPage() {
        $state.go('people.person.give_badge', $state.params, {reload: true});
      }
      console.log("in controller print");

      $scope.print = function() {
        console.log("in print()");
        People.printBadge($scope.person.id)
              .then(nextPage)
              .catch(Flash.set)
              .then(nextPage);
      };

      $scope.print();
    })
    .controller('PersonGiveBadgeController', function($scope, $state, People, FormErrors, focusOn, person, lazyCommit) {
      if (!$scope.person.has_valid_ticket) { $scope.restart(); return; }

      $scope.given = function() {
        People.giveBadge($scope.person.last_badge.id)
              .then(_.partial($scope.fastForward, 'people.person.done'))
              .catch(FormErrors.set);
      };

      $scope.reprint = function() {
        $scope.fastForward('people.person.print');
      };
      $scope.editBadge = function() {
        $scope.fastForward('people.person.badge');
      };

      $scope.keypress = function($index) {
        return {
          left:    _.partial($scope.focusOption, 3, $index-1),
          right:   _.partial($scope.focusOption, 3, $index+1),
        };
      };
      focusOn("option-0");
    })
    .controller('PersonDoneController', function($scope, $state, $timeout) {
      $timeout(function() {
        $state.go('people.search', {query: $scope.person.id});
      },1500);
    });
})();
