function lowestFareCtrl($scope, $rootScope, $timeout, basicService) {
    $scope.cnyCols = [{"name": "F舱位预警价值CNY", "value": "FValue", "type": "String"}, {
        "name": "J舱位预警价值CNY",
        "value": "JValue",
        "type": "String"
    }, {"name": "C舱位预警价值CNY", "value": "CValue", "type": "String"}, {
        "name": "D舱位预警价值CNY",
        "value": "DValue",
        "type": "String"
    }, {"name": "I舱位预警价值CNY", "value": "IValue", "type": "String"}, {
        "name": "W舱位预警价值CNY",
        "value": "WValue",
        "type": "String"
    }, {"name": "S舱位预警价值CNY", "value": "SValue", "type": "String"}, {
        "name": "Y舱位预警价值CNY",
        "value": "YValue",
        "type": "String"
    }, {"name": "P舱位预警价值CNY", "value": "PValue", "type": "String"}, {
        "name": "B舱位预警价值CNY",
        "value": "BValue",
        "type": "String"
    }, {"name": "M舱位预警价值CNY", "value": "MValue", "type": "String"}, {
        "name": "H舱位预警价值CNY",
        "value": "HValue",
        "type": "String"
    }, {"name": "K舱位预警价值CNY", "value": "KValue", "type": "String"}, {
        "name": "U舱位预警价值CNY",
        "value": "UValue",
        "type": "String"
    }, {"name": "A舱位预警价值CNY", "value": "AValue", "type": "String"}, {
        "name": "L舱位预警价值CNY",
        "value": "LValue",
        "type": "String"
    }, {"name": "Q舱位预警价值CNY", "value": "QValue", "type": "String"}, {
        "name": "E舱位预警价值CNY",
        "value": "EValue",
        "type": "String"
    }, {"name": "V舱位预警价值CNY", "value": "VValue", "type": "String"}, {
        "name": "Z舱位预警价值CNY",
        "value": "ZValue",
        "type": "String"
    }, {"name": "T舱位预警价值CNY", "value": "TValue", "type": "String"}, {
        "name": "N舱位预警价值CNY",
        "value": "NValue",
        "type": "String"
    }, {"name": "R舱位预警价值CNY", "value": "RValue", "type": "String"}]

    // $scope.cnyCols.map(o=>{
    //     return ` <td editable-size="sm"      editable-field="${o.value}"></td>`
    // }).join("\r\n")
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
        let r = await basicService.getLowestFare($scope.sm)
        $scope.list = r.data.data;

             container.removeClass('sk-loading')
        !$scope.$$phase&&$scope.$apply()


    }

}


angular
    .module('piApp')
    .controller('lowestFareCtrl', lowestFareCtrl)
;
