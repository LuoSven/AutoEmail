function btnRight($rootScope, $timeout, $state) {

    return {

        restrict: 'A',
        link: function (scope, element, attr) {

            let btnRight = attr.btnRight

            let isHaveRight = false;
            let user = $rootScope.loggedUser;
            let url = $state.current.name;
            if (user.role.isAdmin) {
                isHaveRight = true
            } else {
                let nowPage = user.role.rolePages.find(o => o.url === url)

                isHaveRight = !!nowPage.btnRights[btnRight];
                console.log(nowPage.btnRights + '/' + btnRight)
            }


            isHaveRight ? element.show() : element.remove();

        }
    }
}

angular
    .module('piApp')
    .directive('btnRight', btnRight);
