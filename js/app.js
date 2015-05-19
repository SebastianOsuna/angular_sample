 /**
    Angular application
 **/
(function() {
    var app = angular.module('angular_sample', ['ngStorage']);

    app
    /**
        Navigation Controller
    */
    .controller('NavigationController',
        function($localStorage) {
            var activeTab = angular.copy($localStorage.nav) || 'movementsList';

            this.active = function(tab) {
                activeTab = tab;
                $localStorage.nav = tab;
            };

            this.is = function(tab) {
                return activeTab === tab;
            }
        })
    /**
        Movements Controller
    */
    .controller('MovementsController',
        function($scope, $localStorage) {
            var _movementsSequence = 0,
                _vouchersSequence = 0,
                _this = this;

            this._movement_proto = {
                date: new Date(),
                account: '',
                document: '',
                vouchers: [{}]
            };

            this.new = angular.copy(this._movement_proto);

            this.movements = [];
            this.vouchers = [];

            this.load = function() {
                var placeholder = $localStorage.movements;
                this.movements = placeholder ? angular.copy(placeholder) : [];
                this.movements.forEach(function(movement) {
                    movement.vouchers.forEach(function(voucher) {
                        voucher.parentMovement = _this.movements.filter(function(m) { return m.id === voucher.movement; })[0];
                        delete voucher.movement;
                        _this.vouchers.push(voucher);
                    });
                });
                this._report1();
                this._report2();
                _vouchersSequence = Number($localStorage._vouchersSequence) || 0;
                _movementsSequence = Number($localStorage._movementsSequence) || 0;
            };

            this.persist = function() {
                var data = angular.copy(this.movements);
                data.forEach(function(movement) {
                    movement.vouchers.forEach(function(voucher) {
                        voucher.movement = movement.id;
                        delete voucher.parentMovement;
                    });
                });
                $localStorage.movements = data;
                $localStorage._movementsSequence = _movementsSequence;
                $localStorage._vouchersSequence = _vouchersSequence;
            };

            this.addNewVoucher = function() {
                this.new.vouchers.push({});
                $(document).trigger('new-voucher');
            };
            $(document).trigger('new-voucher');

            this.saveNew = function() {
                this.new.id = ++_movementsSequence;
                var _total = 0;
                this.new.vouchers.forEach(function(voucher) {
                    _total += parseFloat(voucher.value);
                    voucher.parentMovement = _this.new;
                    voucher.id = ++_vouchersSequence;
                    _this.vouchers.push(voucher);
                });
                this.new.total = _total;
                this.new.account = this.new.account.number;

                this.movements.push( this.new );
                this.persist();
                this.reset();
                this._report1();
                this._report2();
            };

            this.reset = function() {
                this.new = angular.copy(this._movement_proto);
            };

            this._report1 = function() {
                var wrapper = {};
                this.vouchers.forEach(function(voucher) {
                    var current =
                        wrapper[voucher.identification] = wrapper[voucher.identification] || { identification: voucher.identification, balance: 0, count: 0 };
                    current.balance += parseFloat(voucher.value);
                    current.count++;
                });
                this.report1 = Object.keys(wrapper).map(function(k) {
                    return wrapper[k];
                });
            };

            this._report2 = function() {
                var wrapper = {};
                this.vouchers.forEach(function(voucher) {
                    var current =
                        wrapper[voucher.account] = wrapper[voucher.account] || { account: voucher.parentMovement.account, balance: 0, count: 0 };
                    current.balance += parseFloat(voucher.value);
                    current.count++;
                });
                this.report2 = Object.keys(wrapper).map(function(k) {
                    return wrapper[k];
                });
            };
        })


        /**
            Accounts Controller
        */
        .controller('AccountsController',
        function($localStorage) {
            this.accounts = [];
            this._new = {
                number: '',
                name: ''
            };
            this.new = angular.copy(this._new);

            this.save = function(newAccount) {
                this.accounts.push(newAccount);
                this.new = angular.copy(this._new);
                this.persist();
            };

            this.load = function() {
                var placeholder = $localStorage.accounts;
                this.accounts = placeholder ? angular.copy(placeholder) : [];
            };

            this.persist = function() {
                var data = angular.copy(this.accounts);
                $localStorage.accounts = data;
            };

            this.load();
        })
        /**
            Persons Controller
        */
        .controller('PeopleController',
            function($localStorage) {
                this.people = [];
                this._new = {
                    id: '',
                    name: ''
                };
                this.new = angular.copy(this._new);

                this.save = function(newPerson) {
                    this.people.push(newPerson);
                    this.new = angular.copy(this._new);
                    this.persist();
                };

                this.load = function() {
                    this.people = angular.copy($localStorage.people) || [];
                };

                this.persist = function() {
                    $localStorage.people = angular.copy(this.people);
                };

                this.load();
            })

        /**
            Currency filter
        */
        .filter('currency', function() {
            return function(input) {
                return isNaN(input) ? input : "$ " + input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            };
        })

        /**
            Date format filter
        */
        .filter('dateFormat', function() {
            var monthsES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            return function(input) {
                var d = new Date(input);
                return d.getDate() + ' de ' + monthsES[d.getMonth()] + ' de ' + d.getFullYear();
            };
        })
        ;
})();

/**
    jQuery fixes
**/
(function() {
    $('#newAccountForm').click(function(jqEv) {
        jqEv.stopPropagation();
    });
    $(document).on('new-voucher', function() {
        setTimeout(function() {
            $('.person_form').click(function(jqEv) {
                $(jqEv.target).unbind('click');
                jqEv.stopPropagation();
            });
        }, 100);
    });
})();
