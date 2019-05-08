function userRoleCtrl($scope, $rootScope, $timeout, $uibModal, commonService, basicService) {
    let container = $('.ibox-content')
    init();
    $scope.sm = {
        roleName: '',
    }


    $scope.search = search;

    async function search() {
        if (container.hasClass('sk-loading')) {
            return
        }
        container.addClass('sk-loading')
        let r = await basicService.getUserRole($scope.sm)
        let list = r.data.data;


        list = list.sort((a, b) => {
            return a.roleName > b.roleName ? 1 : -1;
        })
        $scope.list = list;
        container.removeClass('sk-loading')
        !$scope.$$phase && $scope.$apply()

    }

    $scope.editUserRole = function (model) {
        model = model || {};
        let modalInstance = $uibModal.open({
            templateUrl: 'site/views/modal/user-role-modal.html',
            controller: 'userRoleModalInstanceCtrl',
            size: 'lg',
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

    $scope.deleteUserRole = async function (model) {
        $rootScope.deleteConfirmation($scope, async function () {
            await basicService.deleteSingle('userRole', model._id)
            toastr.info('删除成功')
            await search()
        })
    }
    $scope.getButtonName = function (cat, code) {
        return $scope.dictMap['rights'][cat][code]
    }

    async function init() {
        $scope.menuMap = await commonService.getAllMenusMap();

        $scope.dictMap = await commonService.getDictNameMap();

        await search()

    }


}


function userRoleModalInstanceCtrl($scope, $rootScope, $uibModalInstance, $timeout, commonService, basicService, model) {


    $scope.title = model._id ? '修改' : '新增'
    init()
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.save = async function () {

        if (!$scope.model.roleName) {
            toastr.warning('权限名称不可为空')
            return;
        }


        let model = angular.copy($scope.model)
        if (!model.isAdmin) {
            let isEmpty = isRightEmpty(model)
            if (isEmpty) {
                toastr.warning('请至少分配一个页面权限 ！')
                return;
            }
        }

        model.rolePages.forEach(page => {
            page.viewRights = listToRightOb(page.viewRights)
            page.btnRights = listToRightOb(page.btnRights)
        })
        console.log(model.rolePages)
        model.rolePages = model.rolePages.filter(o => o.viewRights !== {})
        await basicService.saveSingle('userRole', model)
        toastr.info('保存成功！')
        $uibModalInstance.close();
    }
    $scope.isCheckAll = false;
    $scope.setAllPageRight = function () {

        $scope.model.rolePages.forEach(page => {
            $scope.setPageRight(page, $scope.isCheckAll)
        })
    }
    $scope.setPageRight = function (page, checked) {
        if (checked !== undefined) {
            page.checked = checked;
        }
        page.btnRights.forEach(o => {
            o.selected = page.checked
        })
        page.viewRights[1].selected = page.checked;

    }

    $scope.selectViewRight = function (page, viewRight, checked) {
        let rightChecked = !viewRight.selected
        page.viewRights.forEach(o => {
            o.selected = false;
        })
        if (checked !== undefined) {
            viewRight.selected = checked;
        } else {
            viewRight.selected = rightChecked;
        }


    }
    $scope.selectColBtnRights = function (right) {
        $scope.model.rolePages.forEach(page => {
            let btnRight = page.btnRights.find(o => o.code === right.code)
            btnRight.selected = right.selected;
        })

    }


    $scope.selectColViewRights = function (right) {
        let checked = right.selected;
        $scope.viewRights.forEach(o => {
            o.selected = false;
        })
        right.selected = checked;


        $scope.model.rolePages.forEach(page => {
            let viewRight = page.viewRights.find(o => o.code === right.code)
            $scope.selectViewRight(page, viewRight, right.selected)
        })
    }

    async function init() {

        $scope.model = angular.copy(model)
        $scope.model.rolePages = $scope.model.rolePages || []
        if ($scope.model.isAdmin === undefined) {
            if ($scope.model._id && $scope.model.rolePages.length === 0) {
                $scope.model.isAdmin = true;
            } else {
                $scope.model.isAdmin = false;
            }
        }

        let menus = await commonService.getAllMenus()
        let r2 = await basicService.getDict({type: 'rights'})
        let rights = r2.data.data;


        let btnRights = [];
        let viewRights = [];
        rights.forEach(o => {
            if (o.category == 'btn') {
                btnRights.push({code: o.value, name: o.name, selected: false});

            }
            if (o.category == 'view') {
                viewRights.push({code: o.value, name: o.name, selected: false});
            }
        })


        $scope.btnRights = angular.copy(btnRights);
        $scope.viewRights = angular.copy(viewRights);
        let menuList = menus.map(menu => {
            menu.btnRights = angular.copy(btnRights)
            menu.viewRights = angular.copy(viewRights)
            return menu;
        })


        menuList.forEach(menu => {
            let page = $scope.model.rolePages.find(o => o.url === menu.url)
            if (!page) {
                page = angular.copy(menu)
                page.name = menu.name;
                page.parent = {name: menu.parent.name};
                $scope.model.rolePages.push(page)
            } else {
                page.name = menu.name;
                page.parent = {name: menu.parent.name};
                page.btnRights = rightObToList(btnRights, page.btnRights);
                page.viewRights = rightObToList(viewRights, page.viewRights);
            }
        })


        if (!$scope.$$phase) {
            $scope.$apply();
        }


    }


    function isRightEmpty(model) {
        let page = model.rolePages.find(page => {
            let btn = page.btnRights.find(o => o.selected)
            let view = page.viewRights.find(o => o.selected)
            return btn || view;
        })

        return page ? false : true;
    }

}

function rightObToList(oalRight, rightOb, isOnlySelected) {
    let s = angular.copy(oalRight)
    if (isOnlySelected) {
        s = s.filter(o => {
            return !!rightOb[o.code]
        })
    }
    return s.map(o => {

        o.selected = rightOb && !!rightOb[o.code]
        return o;
    })
}

function listToRightOb(list) {
    let s = {};
    list.forEach(o => {
        if (o.selected) {
            s[o.code] = 1;
        }
    })
    return s;
}

angular
    .module('piApp')
    .controller('userRoleCtrl', userRoleCtrl)
    .controller('userRoleModalInstanceCtrl', userRoleModalInstanceCtrl)
;
