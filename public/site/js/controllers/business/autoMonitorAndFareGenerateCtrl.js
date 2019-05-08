function autoMonitorAndFareGenerateCtrl($scope, $http, $rootScope, authService, $state, $location, excelOutputServices, $uibModal, $timeout, basicService) {


    let container = $('.ibox-content')
    $scope.tableWidth = 2700;
    $scope.colsConfig = {
        order: false,
        hidden: false,
        //2个表是否是同步显示
        isLink: true,
    }
    $scope.page = 1;
    $scope.pageSize = 200;
    $scope.sm = {
        publishDate: new Date().format('yyyyMMdd'),
        analyst: '',
        region: '',
        originCityCode: '',
        destinationCityCode: '',
        isPublish: true,
        fareClassCode: '',
        setter: '',
        errorReasonList: []
    }
    $scope.syncStatus = {
        percent: 0,
        total: 0,
        now: 0,
        isFinish: false
    }
    $scope.isShowHandle = location.host.includes('localhost')
    $scope.isPublishAll = false;
    initCol()
    init()


    //发布状态
    $scope.publishStatus = [
        {code: '', name: "全部"}, {code: true, name: "发布"}, {code: false, name: "不发布"}
    ]

    $scope.isShowAllRules = false;

    $scope.userList = []

    //查询现有的csFares
    $scope.searchCzFares = function (fare) {

        let url = `/#/business/czFaresQuery?`;
        let params = {
            od: fare.originCityCode + fare.destinationCityCode,
            cabinList: fare.fareCategoryCode[0] === 'Y' ? 'Q/E/V/Z/T/N' : 'D/I',
            fareCategoryCode: fare.fareCategoryCode,
            beginDate: fare.tocharFtTravelCommenceFrom ? fare.tocharFtTravelCommenceFrom.getDateFromDMY().format('yyyy-MM-dd') : '',
            endDate: fare.tocharFtTravelCommenceToD ? fare.tocharFtTravelCommenceToD.getDateFromDMY().format('yyyy-MM-dd') : '',
            saleDatebegin: fare.tocharFtFirstTicketingDate ? fare.tocharFtFirstTicketingDate.getDateFromDMY().format('yyyy-MM-dd') : '',
            saleDateEnd: fare.tocharFtLastTicketingDate ? fare.tocharFtLastTicketingDate.getDateFromDMY().format('yyyy-MM-dd') : '',
            showReason: 1,
        }
        url += Object.keys(params).map(o => {
            return `${o}=${params[o]}`
        }).join('&')

        window.open(url)

    }

    //打开/关闭 所有下方的规则和发布内容
    $scope.showAllFareRules = function () {

        $scope.isShowAllRules = !$scope.isShowAllRules;
        $scope.list.forEach(o => {
            o.showRules = $scope.isShowAllRules
        })

    }
    //打印sql，console
    $scope.showSql = function (rule) {
        console.log(rule.czFaresSql)
    }
    //选中行
    $scope.selectRow = function (row) {
        if (row.selected) {
            row.selected = false;
        } else {
            $scope.list.forEach(o => {
                o.selected = false
            })
            row.selected = true;
        }
        console.log(row)
        autoChangeCol()
    }
    //转换汇率
    $scope.transCurRate = async function (item, fromField, toField, fromCur, toCur) {
        let amount = item[fromField];
        let r = await basicService.transCurRate(fromCur, toCur, amount);
        item[toField] = r.data.data;
        if (!$scope.$$phase) {
            $scope.$apply();
        }

    }
    //同步代码
    $scope.syncOalStrategy = async function () {
        $rootScope.confirmation($scope, '确认刷新数据', '结束之前可以停止同步，不会影响当天数据', async function () {
            $scope.syncStatus = {
                percent: 0,
                total: 0,
                now: 0,
            }
            let url = '/api/db/baisc/syncOalStrategy?date=' + $scope.sm.publishDate
            await $http.get(url);
            let s =
                setTimeout(function () {
                    checkSyncStatus()
                }, 500)
        })
    }
    $scope.changeOd = function () {
        if ($scope.sm.od) {
            $scope.sm.originCityCode = $scope.sm.od.substr(0, 3).toUpperCase()
            $scope.sm.destinationCityCode = $scope.sm.od.substr(3, 3).toUpperCase()
        }
    }

    //同步现有数据代码
    $scope.syncExistedOalStrategy = async function () {
        $rootScope.confirmation($scope, '确认刷新数据', '结束之前可以停止同步，不会影响当前数据', async function () {
            $scope.syncStatus = {
                percent: 0,
                total: 0,
                now: 0,
            }
            let url = '/api/db/baisc/syncOalStrategy';

            await $http.get(url, {
                params: {
                    date: $scope.sm.publishDate,
                    from: $scope.sm.originCityCode,
                    to: $scope.sm.destinationCityCode,
                    fareClass: $scope.sm.fareClassCode
                }
            });
            let s = setInterval(function () {
                checkSyncStatus()
            }, 500)
            setTimeout(function () {
                clearInterval(s)
            }, 5000)
        })
    }
    $scope.stopSync = async function () {
        $rootScope.confirmation($scope, '确认停止同步？', '已经处理的数据将会被删除，确认停止？', async function () {
            let r = await $http.get('/api/db/baisc/stopSyncOalStrategy');
        })
    }
    //显示每个舱位的价格和原因
    $scope.showCabinReason = function (cabinList) {

        let modalInstance = $uibModal.open({
            templateUrl: 'site/views/modal/fare-cabin-reason-modal.html',
            controller: 'fareCabinReasonModalInstanceCtrl',
            size: 'xl',
            resolve: {
                cabinList: function () {
                    return cabinList
                }
            }
        });
        modalInstance.result.then(async function (data) {
            // $rootScope.uploadExcelResult = data;
        })
    }
    $scope.search = search;
    //发布
    $scope.download = async function () {
        let now = new Date().format('yyyyMMdd')
        let list = $scope.list.filter(o => o.isPublic)
        if (list.length === 0) {
            toastr.warning('请选择需要发布的项目')
            return;
        }
        let publishList = []
        list.forEach(o => {

            o.publishList.forEach(s => {
                s.analyst = o.analyst
                s.publishDate = now;
            })

            publishList = publishList.concat(o.publishList.filter(o => !o.errorReason))
        })
        await basicService.savePublishedFares(publishList)

        excelOutputServices.exportFareAutoTemplate($scope, publishList)
    }
    //显示/隐藏列
    $scope.hiddenCol = function (c) {
        if (c) {

            c.selected = !c.selected;
        }
        $scope.cols.forEach(o => {
            o.selectedCount = o.cols.filter(o => o.selected).length;
            o.selected = o.selectedCount > 0;
        })

        autoChangeCol()
        search()

    }
    //测试规则
    $scope.testRule = function () {
        let row = $scope.list.find(o => o.selected)
        let modalInstance = $uibModal.open({
            templateUrl: 'site/views/modal/fare-publish-rule-test-modal.html',
            controller: 'farePublishRuleTestModalInstanceCtrl',
            size: 'xl',
            resolve: {
                row: function () {
                    return row
                }
            }
        });
        modalInstance.result.then(async function (data) {

            // $rootScope.uploadExcelResult = data;
        })
    }
    //设置列的那些按钮
    $scope.configCol = function (key) {
        let isIn = $scope.colsConfig[key];
        Object.keys($scope.colsConfig).forEach(o => {
            $scope.colsConfig[o] = false;
        })
        $scope.colsConfig[key] = !isIn;
        autoChangeCol()
    }
    //调整列的排序（假）
    $scope.orderCol = function (c) {
        if (c.order === undefined) {
            c.order = 1
            return
        }
        if (c.order === 1) {
            c.order = -1
        } else {
            c.order = 1;
        }

        autoChangeCol()
        search();
    }
    //暂时无用
    $scope.showFareDetails = async function (c) {
        let detailsCols = [
            {
                "name": "ANALYST",
                "type": "String",
                "value": "analyst"
            },
            {
                "name": "REGION",
                "type": "String",
                "value": "region"
            },
            {
                "name": "ORIGIN_CITY_CODE",
                "type": "String",
                "value": "originCityCode"
            },
            {
                "name": "DESTINATION_CITY_CODE",
                "type": "String",
                "value": "destinationCityCode"
            },
            {
                "name": "CARRIER_CODE",
                "type": "String",
                "value": "carrierCode"
            },
            {
                "name": "FARE_CLASS_CODE",
                "type": "String",
                "value": "fareClassCode"
            },
            {
                "name": "CON_METHOD",
                "type": "String",
                "value": "conMethod"
            },
            {
                "name": "OW_RT_IND",
                "type": "String",
                "value": "owRtInd"
            },
            {
                "name": "FARE_AMOUNT",
                "type": "String",
                "value": "fareAmount"
            },
            {
                "name": "FARE_CHANGE_AMOUNT",
                "type": "String",
                "value": "fareChangeAmount"
            },
            {
                "name": "TOCHAR_TARIFF_EFFECTIVE_DATE",
                "type": "String",
                "value": "tocharTariffEffectiveDate"
            },
            {
                "name": "TOCHAR_DISCONTINUE_DATE",
                "type": "String",
                "value": "tocharDiscontinueDate"
            },
            {
                "name": "ROUTING_NUMBER",
                "type": "String",
                "value": "routingNumber"
            },
            {
                "name": "ORIGIN_COUNTRY_CODE",
                "type": "String",
                "value": "originCountryCode"
            },
            {
                "name": "DESTINATION_COUNTRY_CODE",
                "type": "String",
                "value": "destinationCountryCode"
            },
            {
                "name": "FOOTNOTE_CODE",
                "type": "String",
                "value": "footnoteCode"
            },
            {
                "name": "RULE_NUMBER",
                "type": "String",
                "value": "ruleNumber"
            },
            {
                "name": "FARE_CATEGORY_CODE",
                "type": "String",
                "value": "fareCategoryCode"
            },
            {
                "name": "FARE_GROUP_CODE",
                "type": "String",
                "value": "fareGroupCode"
            },
            {
                "name": "FARE_GROUP_ID",
                "type": "String",
                "value": "fareGroupId"
            },
            {
                "name": "CATEGORY_MIN_STAY",
                "type": "String",
                "value": "categoryMinStay"
            },
            {
                "name": "CATEGORY_ADV_PURCHASE",
                "type": "String",
                "value": "categoryAdvPurchase"
            },
            {
                "name": "SURCHARGE_AMOUNT",
                "type": "String",
                "value": "surchargeAmount"
            },
            {
                "name": "ADJUSTMENT_AMOUNT",
                "type": "String",
                "value": "adjustmentAmount"
            },
            {
                "name": "ADJUSTED_AMOUNT",
                "type": "String",
                "value": "adjustedAmount"
            },
            {
                "name": "QUEUE_CHANGE_CODE",
                "type": "String",
                "value": "queueChangeCode"
            },
            {
                "name": "OAL_WEEKDAY",
                "type": "String",
                "value": "oalWeekday"
            },
            {
                "name": "FT_MULTIPLE_RECORD_IND",
                "type": "String",
                "value": "ftMultipleRecordInd"
            },
            {
                "name": "TOCHAR_FT_FIRST_TICKETING_DATE",
                "type": "String",
                "value": "tocharFtFirstTicketingDate"
            },
            {
                "name": "TOCHAR_FT_LAST_TICKETING_DATE",
                "type": "String",
                "value": "tocharFtLastTicketingDate"
            },
            {
                "name": "TOCHAR_FT_TRAVEL_COMMENCE_FROM",
                "type": "String",
                "value": "tocharFtTravelCommenceFrom"
            },
            {
                "name": "TOCHAR_FT_TRAVEL_COMMENCE_TO_D",
                "type": "String",
                "value": "tocharFtTravelCommenceToD"
            },
            {
                "name": "TOCHAR_FT_TRAVEL_COMPLETION_DA",
                "type": "String",
                "value": "tocharFtTravelCompletionDa"
            },
            {
                "name": "TOCHAR_FT_SEASON_START_PERIOD",
                "type": "String",
                "value": "tocharFtSeasonStartPeriod"
            },
            {
                "name": "TOCHAR_FT_SEASON_END_PERIOD",
                "type": "String",
                "value": "tocharFtSeasonEndPeriod"
            },
            {
                "name": "TOCHAR_FT_BLACKOUT_START_PERIO",
                "type": "String",
                "value": "tocharFtBlackoutStartPerio"
            },
            {
                "name": "TOCHAR_FT_BLACKOUT_STOP_PERIOD",
                "type": "String",
                "value": "tocharFtBlackoutStopPeriod"
            },
            {
                "name": "TOCHAR_FT_RESERVATION_FROM_DAT",
                "type": "String",
                "value": "tocharFtReservationFromDat"
            },
            {
                "name": "TOCHAR_FT_RESERVATION_TO_DATE",
                "type": "String",
                "value": "tocharFtReservationToDate"
            },
            {
                "name": "Benchmark ORI",
                "type": "String",
                "value": "benchmarkOri"
            },
            {
                "name": "Benchmark DES",
                "type": "String",
                "value": "benchmarkDes"
            },
            {
                "name": "CXR",
                "type": "String",
                "value": "cxr"
            },
            {
                "name": "TaxGap",
                "type": "String",
                "value": "taxgap"
            },
            {
                "name": "Weekday",
                "type": "String",
                "value": "weekday"
            },
            {
                "name": "Flight",
                "type": "String",
                "value": "flight"
            },
            {
                "name": "Season",
                "type": "String",
                "value": "season"
            },
            {
                "name": "60+",
                "type": "String",
                "value": "60+"
            },
            {
                "name": "30-59",
                "type": "String",
                "value": "30-59"
            },
            {
                "name": "21-29",
                "type": "String",
                "value": "21-29"
            },
            {
                "name": "14-20",
                "type": "String",
                "value": "14-20"
            },
            {
                "name": 43659,
                "type": "String",
                "value": "43659"
            },
            {
                "name": "0-6",
                "type": "String",
                "value": "0-6"
            },
            {
                "name": "KeyOD?",
                "type": "String",
                "value": "keyod"
            },
            {
                "name": "AutoCalc",
                "type": "String",
                "value": "autocalc"
            },
            {
                "name": "CZ Fares",
                "type": "String",
                "value": "czFares"
            },
            {
                "name": "TAR",
                "type": "String",
                "value": "tar"
            },
            {
                "name": "CX",
                "type": "String",
                "value": "cx"
            },
            {
                "name": "ORG",
                "type": "String",
                "value": "org"
            },
            {
                "name": "DES",
                "type": "String",
                "value": "des"
            },
            {
                "name": "FARE CLASS",
                "type": "String",
                "value": "fareClass"
            },
            {
                "name": "CUR",
                "type": "String",
                "value": "cur"
            },
            {
                "name": "AMOUNT",
                "type": "String",
                "value": "amount"
            },
            {
                "name": "O/R",
                "type": "String",
                "value": "o/r"
            },
            {
                "name": "RTG",
                "type": "String",
                "value": "rtg"
            },
            {
                "name": "FT",
                "type": "String",
                "value": "ft"
            },
            {
                "name": "A",
                "type": "String",
                "value": "a"
            },
            {
                "name": "RULE",
                "type": "String",
                "value": "rule"
            },
            {
                "name": "MULTI REC",
                "type": "String",
                "value": "multiRec"
            },
            {
                "name": "DAY/TIME",
                "type": "String",
                "value": "day/time"
            },
            {
                "name": "SEASON DATE",
                "type": "String",
                "value": "seasonDate"
            },
            {
                "name": "FLIGHT APPL",
                "type": "String",
                "value": "flightAppl"
            },
            {
                "name": "ADVP",
                "type": "String",
                "value": "advp"
            },
            {
                "name": "MIN/MAX STAY",
                "type": "String",
                "value": "min/maxStay"
            },
            {
                "name": "BLACKOUT",
                "type": "String",
                "value": "blackout"
            },
            {
                "name": "TRAVEL DATE",
                "type": "String",
                "value": "travelDate"
            },
            {
                "name": "SALES DATE",
                "type": "String",
                "value": "salesDate"
            }
        ]
        if (!c.details) {
            let key = {
                analyst: c.analyst,
                region: c.region,
                originCityCode: c.from,
                destinationCityCode: c.to,
                carrierCode: c.cxr,
            }
            let r = await basicService.getAutoMonitorAndFareGenerateFull(key);
            console.log(r.data.data.length)

            let data = r.data.data[0]
            let details = detailsCols.map(o => {
                return {name: o.name, value: data[o.value]}
            }).filter(o => o.value !== "")
            let rest = 10 - details.length % 10;

            for (let i = 0; i < rest; i++) {
                details.push({})
            }

            c.details = details;
            console.log(c.details.length)

        }


        c.showDetails = !c.showDetails;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    }
    //展示每个内容下方的东西
    $scope.showFareRules = function (c) {
        c.showRules = !c.showRules
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    }
    // 选中/移除 上面的错误原因，并且过滤出来
    $scope.changeErrorReason = async function (errorReason) {
        errorReason.selected = !errorReason.selected;

        let errorReasonList = $scope.ruleReasonGroup.filter(o => o.selected).map(o => o.name)
        $scope.sm.errorReasonList = errorReasonList.join('|');
        await search(false)
        // //过滤错误原因
        // $scope.list = $scope.oalList.filter(o => {
        //     let r = o.noPublishReason.findIndex(r => {
        //         return errorReasonList.findIndex(e => e === r) !== -1;
        //     })
        //     return r !== -1;
        // })
        autoChangeCol()
    };

    $scope.publishAll = function () {
        $scope.isPublishAll = !$scope.isPublishAll;
        $scope.list.forEach(o => {
            o.isPublic = $scope.isPublishAll;
        })

    }
    $scope.checkAll = function () {
        $scope.isCheckAll = !$scope.isCheckAll;
        $scope.list.forEach(o => {
            o.isCheck = $scope.isCheckAll;
        })

    }
    $scope.approveAll = function () {
        $scope.isApproveAll = !$scope.isApproveAll;
        $scope.list.forEach(o => {
            o.isApprove = $scope.isApproveAll;
        })

    }

    //联动上下的y轴滚动轴
    function linkTableScroll() {
        $('#list .table-container').scroll(function () {
            if (!$scope.colsConfig.isLink) {
                return
            }
            $('#emptyList .table-container').scrollLeft($(this).scrollLeft())

        })

        $('#emptyList .table-container').scroll(function () {
            if (!$scope.colsConfig.isLink) {
                return
            }
            $('#list .table-container').scrollLeft($(this).scrollLeft())

        })
    }

    //自动调整宽带和高度
    function autoChangeCol() {
        $timeout(function () {
            let $head = $('.table_head'), $body = $('.table_body'), $container = $('.table-container')
            let minWidth = $container.width() - 20
            let tableWidth = $scope.cols.filter(o => o.selected).sum(o => o.width)
            tableWidth = tableWidth <= minWidth ? minWidth : tableWidth;
            $head.css('width', tableWidth + 'px')
            $body.css('width', tableWidth + 'px')
            let mt = '-' + ($head.height() + 0) + 'px'
            $body.css('marginTop', mt)
            let height = window.innerHeight - 350;
            height = height <= 400 ? 400 : height;
            $('.tbody_container').css('min-height', height + 'px')

        })
    }

    //初始化列，哪些列是默认显示的，每个列的宽度
    function initCol() {
        let colsMap = [

            {
                "name": "运价制定员",
                "type": "String",
                "value": "setter",
                selected: true
            },
            {
                "name": "运价分析员",
                "type": "String",
                "value": "analyst",
                selected: true
            },
            {
                "name": "region",
                "type": "String",
                "value": "region",
                selected: true
            },
            {
                "name": "From",
                "type": "String",
                "value": "originCityCode",
                selected: true
            },
            {
                "name": "To",
                "type": "String",
                "value": "destinationCityCode",
                selected: true
            },
            {
                "name": "Cxr",
                "type": "String",
                "value": "carrierCode",
                selected: true
            },
            {
                "name": "FareClass",
                "type": "String",
                "value": "fareClassCode",
                selected: true
            },
            {
                "name": "FARE_TARIFF_NUMBER",
                "type": "String",
                "value": "fareTariffNumber"
            },
            {
                "name": "CON_METHOD",
                "type": "String",
                "value": "conMethod"
            },
            {
                "name": "OW/RT",
                "type": "String",
                "value": "owRtInd",
                selected: true
            },
            {
                "name": "Cur",
                "type": "String",
                "value": "currencyCode",
                selected: true
            },
            {
                "name": "FareAmount",
                "type": "String",
                "value": "fareAmount",
                selected: true
            },
            {
                "name": "FARE_CHANGE_AMOUNT",
                "type": "String",
                "value": "fareChangeAmount"
            },
            {
                "name": "TOCHAR_TARIFF_EFFECTIVE_DATE",
                "type": "String",
                "value": "tocharTariffEffectiveDate"
            },
            {
                "name": "TOCHAR_DISCONTINUE_DATE",
                "type": "String",
                "value": "tocharDiscontinueDate"
            },
            {
                "name": "ROUTING_NUMBER",
                "type": "String",
                "value": "routingNumber"
            },
            {
                "name": "ORIGIN_AIRPORT_CODE",
                "type": "String",
                "value": "originAirportCode"
            },
            {
                "name": "DESTINATION_AIRPORT_CODE",
                "type": "String",
                "value": "destinationAirportCode"
            },
            {
                "name": "GLOBAL_ROUTING_IND",
                "type": "String",
                "value": "globalRoutingInd"
            },
            {
                "name": "Rule",
                "type": "String",
                "value": "ruleNumber",
            },
            {
                "name": "MAXIMUM_PERMITTED_MILEAGE",
                "type": "String",
                "value": "maximumPermittedMileage"
            },
            {
                "name": "CABOTAGE_IND",
                "type": "String",
                "value": "cabotageInd"
            },
            {
                "name": "BATCH_NUMBER",
                "type": "String",
                "value": "batchNumber"
            },
            {
                "name": "TOCHAR_RECEIVED_DATE",
                "type": "String",
                "value": "tocharReceivedDate"
            },
            {
                "name": "GFS_FILING_ADVICE_NUMBER",
                "type": "String",
                "value": "gfsFilingAdviceNumber"
            },
            {
                "name": "TOCHAR_GFS_FILING_ADVICE_DATE",
                "type": "String",
                "value": "tocharGfsFilingAdviceDate"
            },
            {
                "name": "ORIGIN_COUNTRY_CODE",
                "type": "String",
                "value": "originCountryCode"
            },
            {
                "name": "DESTINATION_COUNTRY_CODE",
                "type": "String",
                "value": "destinationCountryCode"
            },
            {
                "name": "FareCategoryCode",
                "type": "String",
                "value": "fareCategoryCode",
                selected: true
            },
            {
                "name": "FareGroupCode",
                "type": "String",
                "value": "fareGroupCode",
                selected: true
            },
            {
                "name": "FARE_GROUP_ID",
                "type": "String",
                "value": "fareGroupId"
            },
            {
                "name": "CATEGORY_MIN_STAY",
                "type": "String",
                "value": "categoryMinStay"
            },
            {
                "name": "CATEGORY_ADV_PURCHASE",
                "type": "String",
                "value": "categoryAdvPurchase"
            },
            {
                "name": "SURCHARGE_AMOUNT",
                "type": "String",
                "value": "surchargeAmount"
            },
            {
                "name": "TOTAL_FARE",
                "type": "String",
                "value": "totalFare"
            },
            {
                "name": "FN",
                "type": "String",
                "value": "footnoteCode",
                selected: true
            },
            {
                "name": "FARE_CHANGE_PERCENT",
                "type": "String",
                "value": "fareChangePercent"
            },
            {
                "name": "QUEUE_CHANGE_CODE",
                "type": "String",
                "value": "queueChangeCode"
            },
            {
                "name": "TRANSMISSION_HOUR",
                "type": "String",
                "value": "transmissionHour"
            },
            {
                "name": "ONE_WAY_FARE_AMOUNT",
                "type": "String",
                "value": "oneWayFareAmount"
            },
            {
                "name": "ROUND_TRIP_FARE_AMOUNT",
                "type": "String",
                "value": "roundTripFareAmount"
            },
            {
                "name": "QUEUE_STATUS_CODE",
                "type": "String",
                "value": "queueStatusCode"
            },
            {
                "name": "DIFFERENCE",
                "type": "String",
                "value": "difference"
            },
            {
                "name": "PERCENT_DIFFERENCE",
                "type": "String",
                "value": "percentDifference"
            },
            {
                "name": "FARE_STATE_CODE",
                "type": "String",
                "value": "fareStateCode"
            },
            {
                "name": "DISTRIBUTION_GROUP_NUMBER",
                "type": "String",
                "value": "distributionGroupNumber"
            },
            {
                "name": "USER_ACTION_CODE",
                "type": "String",
                "value": "userActionCode"
            },
            {
                "name": "EQUIVALENT_AMOUNT",
                "type": "String",
                "value": "equivalentAmount"
            },
            {
                "name": "FARE_LOCATION",
                "type": "String",
                "value": "fareLocation"
            },
            {
                "name": "POLICY",
                "type": "String",
                "value": "policy"
            },
            {
                "name": "NOTES",
                "type": "String",
                "value": "notes",
            },
            {
                "name": "ORIGINAL_BOOKING_CLASS_CODE",
                "type": "String",
                "value": "originalBookingClassCode"
            },
            {
                "name": "TOCHAR_CHANGE_DATE",
                "type": "String",
                "value": "tocharChangeDate"
            },
            {
                "name": "CHANGE_USER",
                "type": "String",
                "value": "changeUser"
            },
            {
                "name": "FT_MULTIPLE_RECORD_IND",
                "type": "String",
                "value": "ftMultipleRecordInd"
            },
            {
                "name": "TOCHAR_FT_FIRST_TICKETING_DATE",
                "type": "String",
                "value": "tocharFtFirstTicketingDate"
            },
            {
                "name": "TOCHAR_FT_LAST_TICKETING_DATE",
                "type": "String",
                "value": "tocharFtLastTicketingDate"
            },
            {
                "name": "TOCHAR_FT_TRAVEL_COMMENCE_FROM",
                "type": "String",
                "value": "tocharFtTravelCommenceFrom",
                selected: true
            },
            {
                "name": "TOCHAR_FT_TRAVEL_COMMENCE_TO_D",
                "type": "String",
                "value": "tocharFtTravelCommenceToD",
                selected: true
            },
            {
                "name": "TOCHAR_FT_TRAVEL_COMPLETION_DA",
                "type": "String",
                "value": "tocharFtTravelCompletionDa"
            },
            {
                "name": "TOCHAR_FT_SEASON_START_PERIOD",
                "type": "String",
                "value": "tocharFtSeasonStartPeriod"
            },
            {
                "name": "TOCHAR_FT_SEASON_END_PERIOD",
                "type": "String",
                "value": "tocharFtSeasonEndPeriod"
            },
            {
                "name": "TOCHAR_FT_BLACKOUT_START_PERIO",
                "type": "String",
                "value": "tocharFtBlackoutStartPerio"
            },
            {
                "name": "TOCHAR_FT_BLACKOUT_STOP_PERIOD",
                "type": "String",
                "value": "tocharFtBlackoutStopPeriod"
            },
            {
                "name": "TOCHAR_FT_RESERVATION_FROM_DAT",
                "type": "String",
                "value": "tocharFtReservationFromDat"
            },
            {
                "name": "TOCHAR_FT_RESERVATION_TO_DATE",
                "type": "String",
                "value": "tocharFtReservationToDate"
            },
            {
                "name": "MARKET_ANALYST",
                "type": "String",
                "value": "marketAnalyst"
            },
            {
                "name": "MILEAGE_TYPE",
                "type": "String",
                "value": "mileageType"
            },
            {
                "name": "MILEAGE",
                "type": "String",
                "value": "mileage"
            },
            {
                "name": "CIRCUITY_MILEAGE",
                "type": "String",
                "value": "circuityMileage"
            },
            {
                "name": "MARKET_SEQUENCE",
                "type": "String",
                "value": "marketSequence"
            },
            {
                "name": "MARKET_GROUP",
                "type": "String",
                "value": "marketGroup"
            },
            {
                "name": "MARKET_TYPE",
                "type": "String",
                "value": "marketType"
            },


        ];

        $scope.cols = colsMap.map(col => {
            return {name: col.name, value: col.value, selected: col.selected, class: col.class}
        })
        $scope.colWidth = {
            'analyst': 80,
            'setter': 80,
            'queueChangeCode': 30,
            'conMethod': 30,
            'owRtInd': 30,
            'fareClassCode': 70,
            'fareChangeAmount': 60,
            'czFares': 180,
            'fareClass': 120,
            'travelDate': 120,
            'salesDate': 120,
            'min/maxStay': 100,
            'region': 120,
        }
        $scope.cols.forEach((o, i) => {
            o.width = $scope.colWidth[o.value] || 50;

        })

    }

    async function search(isNeedLoadErrorReason = true, isFromPage = false) {

        if (!isFromPage) {
            $scope.page = 1;
        }
        if (container.hasClass('sk-loading')) {
            return
        }
        container.addClass('sk-loading')
        let date = new Date().getTime()
        if (isNeedLoadErrorReason) {
            delete $scope.sm.errorReasonList;
        }
        let field = $scope.cols.filter(o => o.selected).map(o => o.value)
        let params = {
            params: $scope.sm,
            field,
            page: $scope.page,
            pageSize: $scope.pageSize,
        }

        let r = await basicService.getCzReactiveFares(params)


        let searchTime = new Date().getTime() - date;
        date = new Date().getTime()
        let list = r.data.data.list;
        $scope.count = r.data.data.count;


        // $scope.emptylist = list.filter(o => !o.isHaveRule)
        //原始数据表
        if (isFromPage) {
            $scope.oalList = $scope.oalList.concat(angular.copy(list))
            $scope.list = $scope.list.concat(list);


        } else {
            scrollToTop();
            $scope.oalList = angular.copy(list)
            $scope.list = list;
        }


        if (!isFromPage) {
            autoChangeCol()
            if (isNeedLoadErrorReason) {
                delete $scope.sm.errorReasonList;
                let rErrorGroup = await basicService.getNoPublishReasonMap($scope.sm)
                $scope.ruleReasonGroup = rErrorGroup.data.data;
            }

        }
        if (!$scope.$$phase) {
            $scope.$apply();
        }

        let processTime = new Date().getTime() - date;
        console.log(`查询用了${searchTime / 1000}秒,处理数据用了${processTime / 1000}秒`)
        container.removeClass('sk-loading')


    }

    async function init() {

        if ($rootScope.isCanViewAll()) {
            let r = await basicService.getUserRegionOdConfig();
            $scope.analystList = r.data.data.map(o => o.analyst).distinct();
            $scope.analystList.insertAt(0, '全部')
            $scope.setterList = r.data.data.map(o => o.setter).distinct();
            ;
            $scope.setterList.insertAt(0, '全部')
            $scope.sm.analyst = $scope.analystList[0]
            $scope.sm.setter = $scope.setterList[0]
        } else {
            let user = authService.getAuthorizedUser();
            let role = user.role.role;
            if (role === 'analyst') {
                $scope.sm.analyst = $rootScope.loggedUser.userName
            } else {
                $scope.sm.setter = $rootScope.loggedUser.userName
            }
            $scope.analystList = []
            $scope.setterList = []
        }

        let user = authService.getAuthorizedUser();


        if (!$scope.$$phase) {
            $scope.$apply();
        }
        await search(true)
        await checkSyncStatus()
        autoChangeCol()
        linkTableScroll()
        window.onresize = function () {
            autoChangeCol()
        }
        scrollPage()

    }

    async function checkSyncStatus() {
        let r = await $http.get('/api/db/baisc/getSyncStatus');

        let data = r.data;
        $scope.syncStatus.percent = data.allOalCount == 0 ? 0 : ((data.nowOalCount / data.allOalCount) * 100).toFixed(2);
        $scope.syncStatus.total = data.allOalCount;
        $scope.syncStatus.now = data.nowOalCount;
        $scope.syncStatus.publishDate = data.publishDate;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
        if ($scope.syncStatus.total == 0) {
            clearInterval(window.checkSyncStatusInter);
            return
        } else {
            if (window.checkSyncStatusInter == undefined) {
                window.checkSyncStatusInter = setInterval(async function () {
                    checkSyncStatus();
                }, 500)
            }
        }


    }

    function scrollToTop() {
        $('#tbody_container').scrollTop(0)
    }

    function scrollPage() {
        $timeout(function () {

            $('#tbody_container').scroll(async function () {
                if ($scope.scrollPaging || ($scope.list.length == $scope.count)) {
                    return;
                }
                let tableHeight = $('#mainTable').height()
                var scrollTop = $(this).scrollTop();
                var windowHeight = $(this).height();
                let buttom = tableHeight - windowHeight - scrollTop
                if (buttom <= 100) {
                    $scope.scrollPaging = true;
                    $scope.page++;


                    await search(false, true)
                    $scope.scrollPaging = false;
                }
            });
        }, 1000)

    }

}

function farePublishResultModalInstanceCtrl($scope, $uibModalInstance, $rootScope, excelOutputServices, $timeout, basicService) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

function farePublishRuleTestModalInstanceCtrl($http, $scope, $uibModalInstance, $rootScope, excelOutputServices, row, $timeout, basicService) {

    $scope.model = {
        from: 'ROM',
        to: 'CAN',
        fareCategoryCode: 'Y----3',
        fareGroupCode: '6-----',
        flight: '',
        amount: 300,
        noInCabin: 'T,N',
        owrt: 2,
        fareBasisCabin: 'T'
    }
    //为了模拟下
    if (row) {
        $scope.oalModel = row;
        $scope.model.from = row.originCityCode;
        $scope.model.to = row.destinationCityCode;
        $scope.model.fareCategoryCode = row.fareCategoryCode;
        $scope.model.fareGroupCode = row.fareGroupCode;
        $scope.model.owrt = row.owRtInd;
        if (row.rules.length > 0) {
            $scope.model.flight = row.rules[0].flight;
            $scope.model.amount = row.rules[0].amount;
        }
        if (row.publishList.length > 0) {
            $scope.model.fareBasisCabin = row.publishList[0].fareBasis[0];
        }
    }
    $scope.autoCountryCode = async function () {
        if ($scope.model.from) {
            let r = await basicService.getCountryCode($scope.model.from);
            $scope.model.fromCountryCode = r.data.countryCode;
            $scope.model.fromArea = r.data.area;
        }
        if ($scope.model.to) {
            let r = await basicService.getCountryCode($scope.model.to);
            $scope.model.toArea = r.data.area;
            $scope.model.toCountryCode = r.data.countryCode;
        }
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.test = async function (filed) {
        switch (filed) {
            case 'fareFamily':
                let rf = await $http.get(`/api/db/baisc/getTestFareFamily`, {params: $scope.model});

                $scope.model.fareFamily = rf.data;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
                break;
            case 'cabin':
                let rc = await $http.get(`/api/db/baisc/getTestCzCabin`, {params: $scope.model});

                if (rc.data.error) {
                    alert(rc.data.error)
                    return
                }
                $scope.cabinList = rc.data;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
                break;
            case 'strategy':
                let rs = await $http.post(`/api/db/baisc/getOalStrategy`, $scope.oalModel);
                toastr.info(`获取到${rs.data.data.length}条策略`)
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
                break;
        }
    }


    $scope.autoCountryCode()
}

function fareCabinReasonModalInstanceCtrl($http, $scope, $uibModalInstance, cabinList) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.cabinList = cabinList
    console.log(cabinList)
}

angular
    .module('piApp')
    .controller('autoMonitorAndFareGenerateCtrl', autoMonitorAndFareGenerateCtrl)
    .controller('farePublishResultModalInstanceCtrl', farePublishResultModalInstanceCtrl)
    .controller('fareCabinReasonModalInstanceCtrl', fareCabinReasonModalInstanceCtrl)
    .controller('farePublishRuleTestModalInstanceCtrl', farePublishRuleTestModalInstanceCtrl)
;
