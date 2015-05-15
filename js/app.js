(function() {
    var app = angular.module('angular_sample', ['ngStorage']);

    app
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
            };

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
        function() {
            this.accounts = [
                {
                    number: '111020',
                    name: 'Cuenta de ahorros'
                },
                {
                    number: '111021',
                    name: 'Cuenta de aporte'
                }
            ];
        })

        /**
            Currency filter
        */
        .filter('currency', function() {
            return function(input) {
                return isNaN(input) ? input : "$ " + input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            };
        });


})();
