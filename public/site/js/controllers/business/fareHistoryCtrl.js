function fareHistoryCtrl($scope, $http, $rootScope, excelOutputServices, $uibModal, $timeout, basicService) {
    let container = $('.ibox-content')
    init();
    $scope.sm = {
        publishDate: new Date().format('yyyyMMdd'),
        analyst: '',
        org: '',
        des: '',
    }


    $scope.search = search;
    $scope.download = async function () {
        let list = $scope.list.filter(o => o.isPublic)
        if (list.length === 0) {
            toastr.warning('请选择需要发布的项目')
            return;
        }
        let publishList = []
        list.forEach(o => {
            publishList = publishList.concat(o.publishList)
        })
        await basicService.savePublishedFares(publishList)

        excelOutputServices.exportFareAutoTemplate($scope, publishList)
    }


    async function search() {
        if (container.hasClass('sk-loading')) {
            return
        }
        container.addClass('sk-loading')
        let r = await basicService.getCzFaresPublished($scope.sm)

        $scope.list = r.data.data;

         container.removeClass('sk-loading')
        !$scope.$$phase&&$scope.$apply()


    }

    async function init() {

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


angular
    .module('piApp')
    .controller('fareHistoryCtrl', fareHistoryCtrl)
;
