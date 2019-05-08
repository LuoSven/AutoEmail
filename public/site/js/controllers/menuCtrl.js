function menuCtrl($scope, $rootScope, $state, permissionServices, $timeout, authService, commonService) {

    init()

    async function init() {
        let menuConfig = await commonService.getMenus();

        let currentUser = authService.getAuthorizedUser();
        if (currentUser === undefined) {
            return
        }
        let menus = [];
        let isAdmin = currentUser.role.isAdmin;
        console.log( currentUser.role.rolePages)
        let rolePages = currentUser.role.rolePages.filter(o => o.viewRights).map(o => o.url)


        menuConfig.forEach(page => {
            let pageMenus = []
            for (let menu of   page.menus) {
                if (rolePages.indexOf(menu.url) !== -1 || isAdmin) {
                    pageMenus.push(menu)
                }
            }
            if (pageMenus.length > 0) {
                page.menus = pageMenus;
                menus.push(page)
            }
        })

        window.menus = menus;
        menus = menus.sort((a, b) => {
            return a.order - b.order;
        })
        $scope.menus = menus;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
        $timeout(function () {
            $('.metismenu').metisMenu();
        })
    }

}


angular
    .module('piApp')
    .controller('menuCtrl', menuCtrl)
;
