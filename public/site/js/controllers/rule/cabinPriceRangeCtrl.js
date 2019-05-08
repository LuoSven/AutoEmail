function cabinPriceRangeCtrl($scope, $rootScope, $timeout, basicService) {

    let container = $('.ibox-content')
    search()
    $scope.sm = {
        from: '',
        to: '',
    }



    $scope.search = search;

    async function search() {
        if (container.hasClass('sk-loading')) {
            return
        }
        container.addClass('sk-loading')
        let r = await basicService.getCabinPriceRange($scope.sm)
        $scope.list = r.data.data;

             container.removeClass('sk-loading')
        !$scope.$$phase&&$scope.$apply()


    }

}


angular
    .module('piApp')
    .controller('cabinPriceRangeCtrl', cabinPriceRangeCtrl)
;
