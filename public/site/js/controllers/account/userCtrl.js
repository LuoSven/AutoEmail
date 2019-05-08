function userCtrl($scope, $rootScope, $timeout, $uibModal, basicService) {
    let container = $('.ibox-content')
    init();
    $scope.sm = {
        userName: '',
        userAccount: '',


    }


    $scope.search = search;

    async function search() {
        if (container.hasClass('sk-loading')) {
            return
        }
        container.addClass('sk-loading')
        let r = await basicService.getUser($scope.sm)
        $scope.list = r.data.data;

        $scope.list.forEach(o => {
            o.userRolesNames = o.userRoles.map(o => o.roleName).join('/')
        })
        $scope.list = $scope.list.sort((a, b) => {
            return a.userAccount > b.userAccount ? 1 : -1
        })
        container.removeClass('sk-loading')
        !$scope.$$phase && $scope.$apply()

    }

    $scope.editUser = function (model) {
        model = model || {};
        let modalInstance = $uibModal.open({
            templateUrl: 'site/views/modal/user-modal.html',
            controller: 'userModalInstanceCtrl',
            size: 'xl',
            resolve: {
                model: function () {
                    return model
                }
            }
        });
        modalInstance.result.then(async function (data) {
            await search()
        })
    }

    $scope.deleteUser = async function (model) {
        $rootScope.deleteConfirmation($scope, async function () {
            await basicService.deleteSingle('user', model._id)
            toastr.info('删除成功')
            await search()
        })
    }

    async function init() {
        let r = await basicService.getUserRole()
        $scope.roles = r.data.data;
        await search()
    }


}


function userModalInstanceCtrl($scope, $rootScope, $uibModalInstance, $timeout, basicService, model) {

    $scope.title = model._id ? '修改' : '新增'
    init()
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.checkUserAccount = async function () {
        let isExisted = false;
        let r = await basicService.getUser({userAccount: $scope.model.userAccount})
        if (r.data.data.length !== 0) {
            let user = r.data.data[0];
            if ($scope.model._id && model._id !== user._id) {
                isExisted = true;
            }
            if (!$scope.model._id) {
                isExisted = true;
            }


        }

        $scope.isAccountExisted = isExisted
        if (!$scope.$$phase) {
            $scope.$apply();
        }

    }
    $scope.save = async function () {
        await $scope.checkUserAccount()
        if ($scope.isAccountExisted) {
            return;
        }

        if (!$scope.model.userAccount) {
            toastr.warning('用户账号不可为空')
            return;
        }
        if (!$scope.model.userName) {
            toastr.warning('用户名不可为空')
            return;
        }


        if (!$scope.model.userPassword) {
            let password = md5($rootScope.systemConfig.defaultPassword)
            $scope.model.userPassword = password;
        }
        let model = angular.copy($scope.model)
        model.userRoles = model.userRoles.filter(o => o.selected).map(o => {
            return o._id;
        })
        if (model.userRoles.length === 0) {
            toastr.warning('请选择用户角色！')
            return;
        }
        await basicService.saveSingle('user', model)
        toastr.info('保存成功！')
        $uibModalInstance.close();
    }
    $scope.updatePassword = async function () {
        $rootScope.confirmation(
            $scope,
            '确认重置密码？',
            '确认重置密码？',
            async function () {
                let password = md5($rootScope.systemConfig.defaultPassword)
                await basicService.updatePassword(model.userAccount, password)
                toastr.info('重置密码成功！')
            })

    }


    async function init() {

        $scope.model = angular.copy(model)
        let r = await basicService.getUserRole()
        let roles = r.data.data;
        $scope.model.userRoles = $scope.model.userRoles || [];
        $scope.model.userRoles.forEach(o => {
            o.selected = true;
        })
        roles.forEach(role => {

            let index = $scope.model.userRoles.findIndex(o => {
                return o.role == role.role
            })
            role.selected = false;
            if (index == -1) {
                $scope.model.userRoles.push(role)
            }
        })

        if (!$scope.$$phase) {
            $scope.$apply();
        }


    }


}

angular
    .module('piApp')
    .controller('userCtrl', userCtrl)
    .controller('userModalInstanceCtrl', userModalInstanceCtrl)
;
