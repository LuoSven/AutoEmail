function fareAutoFollowStrategyCtrl($scope, $http, $rootScope, excelOutputServices, $uibModal, $timeout, basicService) {
    let container = $('.ibox-content')
    init();
    $scope.strategyTypes = [
        {code: 'business', name: '商务舱', selected: true},
        {code: 'economy', name: '商务舱'}
    ]
    $scope.sm = {
        publishDate: new Date().format('yyyyMMdd'),
        analyst: '',
        od: '',
    }
    $scope.selectStrategy=function(strategy){
        $scope.strategyTypes.forEach()
    }


    $scope.search = search;


    async function search() {
        if (container.hasClass('sk-loading')) {
            return
        }
        container.addClass('sk-loading')

        let strategyType = $scope.strategyTypes.find(o => o.selected).code;
        let r = await basicService.getStrategy(strategyType, $scope.sm)

        $scope.list = r.data.data;

        container.removeClass('sk-loading')
        !$scope.$$phase && $scope.$apply()


    }

    async function init() {

        let r = await basicService.getUser();
        let userList = r.data.data.map(o => {
            return o.userName
        });
        userList.insertAt(0, '全部')

        $scope.userList = userList;

        $scope.sm.analyst = $scope.userList[0]
        $scope.sm.strategyType = $scope.strategyTypes[0]

        await search()

    }
}


angular
    .module('piApp')
    .controller('fareAutoFollowStrategyCtrl', fareAutoFollowStrategyCtrl)
;
