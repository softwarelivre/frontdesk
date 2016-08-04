(function() {
  "use strict";

  angular
    .module("segue.frontdesk.humanized", [ 'segue.frontdesk' ])
    .constant("HumanizedStrings", {
        // categories
        'business':            'corporativo',
        'corporate-promocode': 'funcionário',
        'caravan':           'caravanista',
        'caravan-leader':    'líder de caravana',
        'foreigner':         'estrangeiro',
        'foreigner-student': 'estrangeiro estudante',
        'government':        'empenho',
        'gov-promocode':     'funcionário público',
        'normal':            'individual',
        'promocode':         'código promocional',
        'proponent':         'proponente',
        'proponent-student': 'proponente estudante',
        'speaker':           'palestrante',
        'student':           'estudante',
        'donation':          'doação',

        // payment types && modes
        'cash': 'dinheiro',
        'card': 'cartão',


        // purchase statuses
        'pending':    'pendente',
        'paid':       'pago',
        'reimbursed': 'reembolsado',
        'stale':      'vencido',
        'cancelled':  'cancelado',

    });
})();
