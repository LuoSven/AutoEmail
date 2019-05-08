function baseCtrl($scope, $rootScope, permissionServices, basicService) {


    $scope.hasPagePermission = function (page) {

        var currentUser;

        if ($rootScope.loggedUser) {
            currentUser = $rootScope.loggedUser;
        }

        if (!currentUser) return false;

        page.menus.forEach(menu => {
            if (currentUser.role.rolePages.indexOf(menu)) {
            }
        })
        return permissionServices.hasPagePermission(currentUser.role, pageName);
    }

    $scope.hasComponentPermission = function (pageName, permissionToCheck) {
        var currentUser;

        if ($rootScope.loggedUser) {
            currentUser = $rootScope.loggedUser;
        }

        if (!currentUser) return false;
        return permissionServices.hasComponentPermission(currentUser.roles, pageName, permissionToCheck);
    }

    $rootScope.saveSingle = function (table, model) {

    }


}


angular
    .module('piApp')
    .controller('baseCtrl', baseCtrl)
;
