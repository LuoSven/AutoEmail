function czFaresQueryCtrl($scope, $http, $rootScope, $location, $uibModal,$sce, $timeout, basicService) {
    let container = $('.ibox-content')

    let colorMaps = ["247,184,215", "177,175,212", "198,229,92", "234,245,4", "239,198,26", "232,156,22"]

    $scope.cabinListMap = {}

    $scope.sm = {}

    let nameMap = {
        od: 'OD',
        fareCategoryCode: 'FareCategoryCode',
        beginDate: 'TravelDateBegin',
        endDate: 'TravelDateEnd',
        saleDatebegin: 'SaleDateBegin',
        saleDateEnd: 'SaleDateEnd',
        cabinList: '舱位范围（/分割）',
    }
    $scope.transToDate = function (field) {
        if (field === 'beginDate' || field === 'endDate') {
            let value = $scope.sm[field]
            if (/[a-zA-Z]/.test(value)) {
                $scope.sm[field] = value.getDateFromDMY().format('yyyy-MM-dd')
            }
        }
    }

    init();
    $scope.search = search;


    async function search() {
        if (!$scope.sm.od) {
            toastr.warning('od不可以为空')
            return
        }
        if (container.hasClass('sk-loading')) {
            return
        }
        container.addClass('sk-loading')


        let r = await basicService.getCzFares($scope.sm)
        let list = r.data.data.list;
        console.log(r.data.data.sql)


        if ($scope.sm.showReason) {
            let sm = {
                od: $scope.sm.od
            }
            let r2 = await basicService.getCzFares(sm);
            let allList = r2.data.data.list;
            allList.forEach(row => {
                let index = list.findIndex(o => o.RAW_ID === row.RAW_ID)
                if (index === -1) {
                    row.isNotIn = true;
                    row.noInReason = getNotInReason($scope.sm, row)
                }
                list.push(row);
            })
        }

        $scope.list = list;
        if ($scope.sm.cabinList) {
            $scope.cabinListMap = {}
            let cabinList = $scope.sm.cabinList.split('/')
            cabinList.forEach((o, i) => {
                $scope.cabinListMap[o] = colorMaps[i]
            })
        } else {
            $scope.cabinListMap = undefined;
        }

        $scope.list = $scope.list.sort(firstBy('rbdIndex').thenBy('FARE_AMOUNT'))

        container.removeClass('sk-loading')
        !$scope.$$phase && $scope.$apply()

    }

    async function init() {
        let params = $location.search();
        $scope.smFieldList = Object.keys(nameMap).map(o => {
            $scope.sm[o] = params[o];
            return {
                name: nameMap[o] || o,
                code: o,
            }
        })

        $scope.sm.showReason = !!params.showReason;
        if ($scope.sm.od) {
            await search()
        }


    }

    function getNotInReason(sm, ob) {
        let reasons = []

        if (sm.fareCategoryCode) {

            let fcc03 = sm.fareCategoryCode.substr(0, 3)
            let advp = sm.fareCategoryCode.substr(3, 2)
            advp = advp === '--' ? 0 : parseInt(advp);

            if (ob.FARE_CATEGORY_CODE_3 !== fcc03) {
                reasons.push('fareCategoryCode前3位不符合')
            }
            if (ob.ADVP > advp) {
                reasons.push('最小停留期大于' + advp)
            }
        }

        //FIRST_TRAVEL_DATE,LAST_TRAVEL_DATE,FIRST_TICKETING_DATE,LAST_TICKETING_DATE
        if (sm.beginDate && sm.endDate) {
            let isIn = isInRange(sm.beginDate, sm.endDate, 'FIRST_TRAVEL_DATE', 'LAST_TRAVEL_DATE');
            if (!isIn) {
                reasons.push('TravelDate不在范围内')
            }
        }
        if (sm.saleDatebegin && sm.saleDateEnd) {
            let isIn = isInRange(sm.beginDate, sm.endDate, 'FIRST_TICKETING_DATE', 'LAST_TICKETING_DATE');
            if (!isIn) {
                reasons.push('SaleDate不在范围内')
            }
        }
        if (sm.cabinList) {
            let cabinList = sm.cabinList.split('/')
            if (cabinList.indexOf(ob.RBD) === -1) {
                reasons.push('舱位不符合需要的舱位')
            }
        }


        function isInRange(begin, end, beginField, endField) {
            let beginValue = ob[beginField], endValue = ob[endField];
            let isIn = (beginValue === null || beginValue <= begin) && (endValue === null || endValue <= end)
            return isIn;

        }


        return reasons.join(',\r\n');

    }
}


angular
    .module('piApp')
    .controller('czFaresQueryCtrl', czFaresQueryCtrl)
;
