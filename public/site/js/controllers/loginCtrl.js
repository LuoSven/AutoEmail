function loginCtrl($scope, $rootScope, $state, userServices, $uibModal, commonService, authService) {


    // authService.userAuthorize({name: '南航品牌运价', displayName: '南航'});
    // $rootScope.loggedUser = authService.getAuthorizedUser();
    // $state.go("basic.countryDirectionCode");
    //
    // return
    let user = authService.getAuthorizedUser()
    if (user) {
        afterLogin(user);
    }


    $scope.loginUser = {userAccount: "", userPassword: ""};

    $scope.login = async function () {
        if (!$("#homeloginForm").valid()) {
            return
        }
        var loginUser = angular.copy($scope.loginUser);
        let r = await userServices.login(loginUser);
        if (r.data.code !== 0) {
            toastr.warning(r.data.message)
            return
        }
        let user = r.data.data;
        if (user.userRoles.length === 0) {
            toastr.warning('您的账号还没有指定角色权限，请联系管理员')
            return
        }
        if (!user.isActive) {
            toastr.warning('您的账号还未激活，请联系管理员')
            return
        }

        if (user.userRoles.length === 1) {
            user.role = user.userRoles[0]
            await doLogin(user)
            return
        }
        //多个角色，要选一下
        let modalInstance = $uibModal.open({
            templateUrl: 'site/views/modal/role-chose-modal.html',
            controller: 'choseRoleModalInstanceCtrl',
            size: 'xs',
            resolve: {
                model: function () {
                    return user
                }
            }
        });
        modalInstance.result.then(async function (user) {
            await doLogin(user)
        })

    }

    async function doLogin(user) {
        //过度下user的权限

        if (user.role.rolePages.length === 0 && user.role.isAdmin === undefined) {
            user.role.isAdmin = true;
        }


        //精简user对象，太大cookie存不进去；
        delete user.userPassword;
        delete user.userRoles;
        // delete user.role.roleName;
        delete user.role.roleDesc;
        delete user.role._id;
        delete user._id;
        delete user.userRoles;
        user.role.rolePages.forEach(o => {


            if (o.btnRights && o.btnRights.push) {
                o.btnRights = tranListToOb(o.btnRights)
            }
            if (o.btnRights && o.viewRights.push) {
                o.viewRights = tranListToOb(o.viewRights)
            }


            delete o.name;
            delete o.parent;
            delete o.checked;


        })
        await afterLogin(user)

        function tranListToOb(rightList) {
            let right = {}
            rightList.forEach(r => {
                if (r.selected) {
                    right[r.code] = 1;
                }
            })
            return right;
        }

    }

    async function afterLogin(user) {
        //载入系统配置
        let r = await commonService.getConfig();
        commonService.setLocalConfig(r.data.data.config)
        $rootScope.systemConfig = r.data.data.config;
        authService.userAuthorize(user)
        $rootScope.loggedUser = user;
        $state.go('business.autoMonitorAndFareGenerate')
    }


}

function choseRoleModalInstanceCtrl($scope, $uibModalInstance, model) {
    $scope.model = angular.copy(model)
    $scope.selectRole = function (role) {
        $scope.model.role = role;
        $uibModalInstance.close($scope.model);
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

angular
    .module('piApp')
    .controller('loginCtrl', loginCtrl)
    .controller('choseRoleModalInstanceCtrl', choseRoleModalInstanceCtrl)
;
