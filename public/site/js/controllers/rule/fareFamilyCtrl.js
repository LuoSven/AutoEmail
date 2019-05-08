function fareFamilyCtrl($scope, $rootScope, $timeout, basicService) {

    let container = $('.ibox-content')
    search()
    $scope.sm = {
        depArea: '',
        arrArea: '',
    }


    $scope.search = search;

    async function search() {
        if (container.hasClass('sk-loading')) {
            return
        }
        container.addClass('sk-loading')
        let r = await basicService.getFareFamily($scope.sm)
        $scope.list = r.data.data;

             container.removeClass('sk-loading') 
        !$scope.$$phase&&$scope.$apply()


    }

}


angular
    .module('piApp')
    .controller('fareFamilyCtrl', fareFamilyCtrl)
;
