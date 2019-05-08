function internationalReactiveStrategyManageCtrl($scope, $http, $rootScope, $uibModal, $timeout, basicService) {
    let container = $('.ibox-content')

    init();
    $scope.editStrategy = function (strategy) {

        strategy = strategy || {};
        $scope.modalInstance = $uibModal.open({
            templateUrl: 'site/views/modal/internationalStrategy-edit-modal.html',
            controller: 'internationalStrategyEditModalInstanceCtrl',
            size: 'lg',
            resolve: {
                model: function () {
                    return strategy;
                },
                strategyType: function () {
                    return $scope.sm.strategyType;
                },
                isApprove: function () {
                    return false;
                }
            }
        });
    }

    $scope.applyStrategy = function (strategy) {

        strategy = strategy || {};
        $scope.modalInstance = $uibModal.open({
            templateUrl: 'site/views/modal/internationalStrategy-edit-modal.html',
            controller: 'internationalStrategyEditModalInstanceCtrl',
            size: 'lg',
            resolve: {
                model: function () {
                    return strategy;
                },
                strategyType: function () {
                    return $scope.sm.strategyType;
                },
                isApprove: function () {
                    return true;
                }
            }
        });
    }


    $scope.changeStrategyType = async function (code) {
        $scope.sm.strategyType = code;
        await $scope.search()
    }
    $scope.search = async function () {
        $scope.page = 1;
        $scope.count = 0;
        await search()
    };

    $scope.gotoPage = async function (page) {
        $scope.page = page;
        await search()
    }

    $scope.showStrategyHistory = function (strategy) {
        strategy.showHistory = !strategy.showHistory;
    }

    async function search() {
        if (container.hasClass('sk-loading')) {
            return
        }
        container.addClass('sk-loading')
        let sm = angular.copy($scope.sm);

        console.log(sm.strategyType)
        if (sm.analyst === '全部') {
            delete sm.analyst
        }
        let r = await basicService.getStrategy(sm, $scope.page, $scope.pageSize)

        $scope.list = r.data.data.list;
        $scope.list.forEach(row => {
            row.advpGap = [row['60+'], row['30-59'], row['21-29'], row['14-20'], row['7-13'], row['0-6']].join(',') + ';'
            row.status = '';
            if (row.apply) {
                row.status = '待审核'
            }


        })


        $scope.count = r.data.data.count;

        container.removeClass('sk-loading')
        !$scope.$$phase && $scope.$apply()


    }

    async function init() {
        $scope.page = 1;
        $scope.pageSize = 50;
        $scope.count = 0;

        $scope.sm = {
            analyst: '',
            od: '',
            strategyType: ''
        }

        $scope.strategyTypeList = [{code: 'business', name: '商务舱'}, {code: 'economy', name: '经济舱'}]
        $scope.sm.strategyType = $scope.strategyTypeList[0].code;
        let r = await basicService.getUser();
        let userList = r.data.data.map(o => {
            return o.userName
        });
        userList.insertAt(0, '全部')

        $scope.userList = userList;
        $scope.sm.analyst = $scope.userList[0]
        await search()

    }
}

function internationalStrategyEditModalInstanceCtrl($scope, $uibModalInstance, $rootScope, basicService, authService, model, isApprove, strategyType) {
    $scope.title = isApprove ? '审核' : (model._id ? '调整' : '新增')
    let user = authService.getAuthorizedUser()
    $scope.selectAll = false;
    $scope.model = angular.copy(model) || {};
    $scope.oldMadel = angular.copy(model);
    $scope.different = {}
    $scope.strategyType = strategyType;
    $scope.isApprove = isApprove;
    if (isApprove) {
        $scope.apply = model.apply;
        $scope.different = model.apply.different;
        //这里要根据different的字段同步过去

        $scope.model = model.apply.strategy;
    } else {
        $scope.apply = {
            reason: '',
            status: 10,
            strategyType,
            "od": model.od,
            "poo": model.poo,
            "cxr": model.benchmarkCxr,
            applier: user.userName
        }
    }


    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    let numberField = ["taxgap", "60+", "30-59", "21-29", "14-20", "7-13", "0-6"]

    $scope.gapList = ["60+", "30-59", "21-29", "14-20", "7-13", "0-6"]
    $scope.showDifferent = function () {
        $scope.different = {};
        Object.keys($scope.model).forEach(key => {
            if (key.indexOf('_array') !== -1 || key.indexOf('_min') !== -1 || key.indexOf('_max') !== -1) {
                return;
            }

            if (key === 'strategyType' || key === 'comments') {
                return;
            }
            let newValue = $scope.model[key], oldValue = $scope.oldMadel[key];

            if (oldValue === "" || oldValue == undefined) {
                return
            }
            if (newValue != oldValue) {
                if (numberField.indexOf(key) !== -1) {
                    let reduce = newValue - oldValue;
                    $scope.different[key] = (reduce > 0 ? '+' : '-') + Math.abs(reduce)
                    return;
                }
                $scope.different[key] = oldValue;
                return;
            }
            delete $scope.different[key]
        })

    }
    $scope.save = async function () {
        if ($scope.different !== {} && $scope.apply.reason === '') {
            toastr.warning('请说明调整原因！')
            return;
        }

        if ($scope.different !== {}) {
            $rootScope.confirmation($scope, '调整确认', '您调整了部分跟进参数，需要进行审核，确认提交吗？', async function () {
                await save()
                $uibModalInstance.close()
            })
        } else {
            await save()
            $uibModalInstance.close()
        }

    }


    $scope.approve = async function () {
        $rootScope.confirmation($scope, '确认通过调整', '确认通过本次调整？', async function () {
            await approve()

            $uibModalInstance.close()
        })

    }


    async function approve() {

        let tableName = `strategy_${$scope.strategyType}`

        let model = angular.copy($scope.model);

        model.appliedList = model.appliedList.map(o => o._id)
        model.appliedList.push(model.apply._id)
        let apply = angular.copy(model.apply);
        apply.status = 20;
        delete model.apply;

        let r = await basicService.saveSingle(tableName, model)
        let r2 = await basicService.saveSingle('strategy_apply', apply)

    }

    async function save() {
        let tableName = `strategy_${$scope.strategyType}`

        let model = angular.copy($scope.model);
        if ($scope.different !== {}) {
            //需要审批
            $scope.apply.strategy = model;
            $scope.apply.applyTime = new Date().format('yyyy-MM-dd');
            $scope.apply.approveList = []
            $scope.apply.different = $scope.different;
            let r = await basicService.saveSingle('strategy_apply', $scope.apply)
            await basicService.updateStrategyApply(model._id, r.data.data, tableName)

        } else {

            await basicService.saveSingle(tableName, model)
        }


    }
}


angular
    .module('piApp')
    .controller('internationalReactiveStrategyManageCtrl', internationalReactiveStrategyManageCtrl)
    .controller('internationalStrategyEditModalInstanceCtrl', internationalStrategyEditModalInstanceCtrl)
;
