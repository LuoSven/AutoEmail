function userRegionOdConfigCtrl($scope, $rootScope, $timeout, basicService) {
    let container = $('.ibox-content')
    init();
    search()
    $scope.sm = {
        analyst:'',
        od: '',

    }


    $scope.search = search;

    async function search() {
        if (container.hasClass('sk-loading')) {
            return
        }
        container.addClass('sk-loading')
        let r = await basicService.getUserRegionOdConfig($scope.sm)
        $scope.list = r.data.data;

             container.removeClass('sk-loading')
        !$scope.$$phase&&$scope.$apply()


    }

    async function  init(){
        let r = await basicService.getUser();


        $scope.userList = r.data.data.map(o => {
            return o.userName
        });
    }

    $scope.saveSingle = async function (model) {

        return await basicService.saveSingle('userRegionOdConfig', model)
    }
    $scope.deleteSingle = async function (model) {
        return await basicService.deleteSingle('userRegionOdConfig', model._id)
    }

}


angular
    .module('piApp')
    .controller('userRegionOdConfigCtrl', userRegionOdConfigCtrl)
;
