function exampleCtrl($scope, exampleServices) {
    exampleServices.getData().then(res => {
        $scope.dataList = res.data;
    })
}

angular
.module('piApp')
.controller('exampleCtrl', exampleCtrl);