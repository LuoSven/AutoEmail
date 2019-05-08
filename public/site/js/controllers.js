//Default
function defaultCtrl($scope, $rootScope, authService, $http, $state, $location, $uibModal, commonService, userServices) {


    $rootScope.systemConfig = commonService.getLocalConfig()
    $rootScope.isCanViewAll = function () {
        let url = $state.current.name;
        let user = authService.getAuthorizedUser();
        if (user.role.isAdmin) {
            return true
        }
        let nowPage = user.role.rolePages.find(o => o.url === url)

        return !!nowPage.viewRights.viewAll;
    }

    $rootScope.exportAsCSV = function (customName, data) {
        const csvData = data.join('\n');
        let aTag = document.createElement('a');
        var _utf = "\uFEFF"; // 为了使Excel以utf-8的编码模式，同时也是解决中文乱码的问题
        aTag.target = '_blank';
        aTag.download = customName + '.csv';
        if (window.Blob && window.URL && window.URL.createObjectURL) {
            var csv = new Blob([_utf + csvData], {
                type: 'text/csv'
            });
            aTag.href = URL.createObjectURL(csv);
        } else {
            aTag.href = 'data:attachment/csv;chartset=utf-8,%EF%BB%BF' + encodeURIComponent(csvData);
        }
        document.body.appendChild(aTag);
        aTag.click();
        document.body.removeChild(aTag);

    }
    $rootScope.uploadExcel = function () {
        let modalInstance = $uibModal.open({
            templateUrl: 'site/views/modal/upload.html',
            controller: 'uploadModalInstanceCtrl',
            size: 'lg',
            resolve: {}
        });
        modalInstance.result.then(async function (data) {

            // $rootScope.uploadExcelResult = data;
        })
    }


    $rootScope.loggedUser = authService.getAuthorizedUser();

    //save confirmation
    $scope.saveConfirmation = function (targetScope, action) {
        $scope.modalInstance = $uibModal.open({
            templateUrl: '/resources/views/modal/save-confirmation-modal.html',
            controller: 'saveConfirmationModalInstanceCtrl',
            resolve: {
                confirmAction: function () {
                    return action;
                },
                targetScope: function () {
                    return targetScope;
                }
            }
        });
    }

    $rootScope.confirmation = function (targetScope, title, confirmMessage, confirmAction, config) {
        config = config || {};
        var isAllowClose = config.isAllowClose;
        isAllowClose = isAllowClose == undefined ? true : isAllowClose;
        $scope.modalInstance = $uibModal.open({
            templateUrl: '/resources/views/modal/confirmation-modal.html',
            controller: 'confirmationModalInstanceCtrl',
            backdrop: 'static',
            resolve: {
                confirmAction: function () {
                    return confirmAction
                },
                confirmMessage: function () {
                    return confirmMessage
                },
                title: function () {
                    return title
                },
                targetScope: function () {
                    return targetScope;
                },
                isAllowClose: function () {
                    return isAllowClose
                }
            }
        });
    }
    $rootScope.deleteConfirmation = function (targetScope, action) {
        $scope.modalInstance = $uibModal.open({
            templateUrl: '/resources/views/modal/delete-confirmation-modal.html',
            controller: 'deleteConfirmationModalInstanceCtrl',
            resolve: {
                confirmAction: function () {
                    return action;
                },
                targetScope: function () {
                    return targetScope;
                }
            }
        });
    }


    $rootScope.scenarioShiftStaffModel = function (scenarioShift) {
        $scope.modalInstance = $uibModal.open({
            templateUrl: 'site/views/modal/scenario-shift-staff-modal.html',
            controller: 'scenarioShiftStaffModalInstanceCtrl',
            resolve: {
                scenarioShift: function () {
                    return scenarioShift;
                }
            }
        });
    }


    //自动完成一页
    $rootScope.autoMakeOnePage = function (isAuto) {
        isAuto = isAuto === undefined ? true : isAuto;
        $('.emptyHolder').attr('style', '');
        if (!isAuto) {
            return
        }
        var onePageHeight = PXConvert.mm2px(297 - 90),
            items = $('#businessTripPrint > div'),
            page = 1, totalHeight = 0;
        var log = {pages: [], onePageHeight}
        for (var i = 0; i < items.length; i++) {
            var item = items[i]
            var height = $(item).height() + 25
            totalHeight += height;

            if (totalHeight >= onePageHeight) {
                log.pages.push({pageIndex: page, totalHeight: totalHeight - height})
                //某一笔应该不会打整个页面吧
                if (i != 0) {
                    // $(items[i - 1]).css({
                    //     'page-break-after': 'always'
                    // })
                    var $content = $(items[i - 1])
                    console.log($content[0]);
                    var emptyHolder = $content.find('.emptyHolder')
                    emptyHolder.css({
                        'page-break-after': 'always',
                        'border-bottom': '1px dashed #333'
                    })
                }
                page += 1
                totalHeight = height;
            }
            var emptyLast = $(items[items.length - 1]).find('.emptyHolder')
            emptyLast.css({
                'border-bottom': '1px dashed #333'
            })
        }
        log.pages.push({pageIndex: page, totalHeight: totalHeight})
        console.log(log)

    }

    $rootScope.updatePassword = function () {
        let modalInstance = $uibModal.open({
            templateUrl: 'site/views/modal/update-password.modal.html',
            controller: 'updatePasswordModalInstanceCtrl',

            resolve: {}
        });
        modalInstance.result.then(async function (data) {
            authService.userInvalid();
            $location.path("/login");
        })


    }

}

//translateCtrl - Controller for translate
function translateCtrl($translate, $scope) {
    $scope.changeLanguage = function (langKey) {
        $translate.use(langKey);
    };
}

//logout
function logoutCtrl($scope, $uibModal) {

    $scope.logoutConfirm = function () {
        $scope.modalInstance = $uibModal.open({
            templateUrl: '/resources/views/modal/logout-modal.html',
            controller: 'logoutModalInstanceCtrl'
        });
    }
}

function logoutModalInstanceCtrl($scope, $uibModalInstance, authService, $location) {

    $scope.logout = function () {
        $uibModalInstance.close();
        authService.userInvalid();

        $location.path("/login");
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

function saveConfirmationModalInstanceCtrl($scope, $uibModalInstance, authService, $location, confirmAction, targetScope) {
    $scope.confirmAction = confirmAction;
    $scope.targetScope = targetScope;
    $scope.confirm = function () {
        $scope.targetScope.$eval($scope.confirmAction);
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

function deleteConfirmationModalInstanceCtrl($scope, $uibModalInstance, authService, $location, confirmAction, targetScope) {
    $scope.confirmAction = confirmAction;
    $scope.targetScope = targetScope;
    $scope.confirm = function () {
        $scope.targetScope.$eval($scope.confirmAction);
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

function scenarioShiftStaffModalInstanceCtrl($scope, $uibModalInstance, scenarioServices, scenarioShift) {
    scenarioServices.getScenarioShiftStaffs(scenarioShift.id).then(function (res) {
        $scope.dataList = res.data;
    }, function (err) {
        toastr.error("查询出错")
    });

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

function uploadModalInstanceCtrl($scope, $rootScope, $timeout, $uibModalInstance, commonService, authService) {
    $scope.userName = $rootScope.loggedUser.userName;
    let tableMap = {}
    $scope.isReady = false;
    commonService.getTableMap().then(r => {
        tableMap = r.data.data;
        $scope.isReady = true;
    })

    $timeout(function () {
        init();
    })

    $scope.isCanUpload = false;
    $scope.isNoDeleted = false;
    $scope.sheets = []
    $scope.data = {}

    $scope.changeDelete = function () {
        $scope.isNoDeleted = !$scope.isNoDeleted;
    }

    $scope.sync = function () {

        //导出成json数据
        $scope.sheets.forEach(sheet => {
            let table = {
                tableName: sheet.value,
                cols: sheet.cols
            }

            table.idRules = sheet.idRules;
            tableMap[sheet.name] = table;


        })
        commonService.setTableMap(tableMap).then(r => {

            toastr.info('同步完毕')
        })


    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.copyCol = function (col, sheet, index) {
        let col1 = angular.copy(col)
        col1.name = col1.name + '_1'
        sheet.cols.insertAt(index - 1, col1)

    }
    $scope.setIdRules = function (sheet, field) {
        let index = sheet.idRules.indexOf(field)
        if (index === -1) {
            sheet.idRules.push(field)
        } else {
            sheet.idRules.removeAt(index)
        }
    }
    $scope.autoFieldName = function (sheet) {
        sheet.cols.forEach(col => {
            let value = col.name.toString().toLocaleLowerCase();
            value = value.replaceAll(' ', '_')
            value = toHump(value)
            col.value = value;
        })

        // 下划线转换驼峰
        function toHump(name) {
            return name.replace(/\_(\w)/g, function (all, letter) {
                return letter.toUpperCase();
            });
        }
    }


    $scope.upload = async function () {

        //导出成json数据
        let datas = []
        $scope.sheets.forEach(sheet => {
            if (!sheet.selected) {
                return
            }
            let data = {
                tableChineseName: sheet.name,
                tableName: sheet.value,
                cols: sheet.cols.map(o => {
                    o.type = "String"
                    return o;
                }),
                idRules: sheet.idRules,
                data: []
            }

            for (let i = 2; i <= sheet.rowCount; i++) {
                let rowData = {}

                for (let col of  sheet.cols) {
                    // if(col.name==="TOCHAR_FT_FIRST_TICKETING_DATE"){
                    //     debugger;
                    // }
                    let key = col.key + i.toString();

                    let value = $scope.data[sheet.name][key]

                    let tvalue = value ? value.v : "";

                    tvalue = tvalue == 0 ? 0 : tvalue || '';
                    tvalue = tvalue.toString()

                    if (sheet.value === 'cabinPriceRange' && col.value === 'from') {

                        if (tvalue === "") {

                            break;
                        }
                    }
                    if (col.name === '上浮' || col.name === "下浮") {
                        tvalue = parseFloat(tvalue) * 100
                    }
                    //包含单位的数字，要把数字拿出来
                    if (col.unitValue) {
                        tvalue = tvalue.replace(/[^0-9]/ig, "")
                    }
                    //包含单位的数字，要把单位拿出来
                    if (col.unit) {
                        tvalue = tvalue.replace(/[0-9]/g, '').replace(/\s/g, '');
                        tvalue = tvalue || col.unit;
                    }
                    rowData[col.value] = tvalue;
                }

                if (Object.keys(rowData).length === 0) {
                    continue;
                }


                if (sheet.idRules.length > 0) {
                    let _id = sheet.idRules.map(f => {
                        return rowData[f]
                    }).join('_')
                    rowData._id = _id;
                }
                if (rowData['depArea'] == 0) {
                    continue
                }


                data.data.push(rowData)
            }

            datas.push(data)

        })


        for (let s of datas) {
            let mainMessage = '正在上传 ' + s.tableName + ' 表:'
            $scope.uploadMessage = mainMessage + '预处理数据中'
            !$scope.$$phase && $scope.$apply();


            $scope.uploadMessage = mainMessage + '预处理数据完毕'
            !$scope.$$phase && $scope.$apply();

            let totalCount = s.data.length;
            let nowCount = 0;
            //分组上传，每组一千条
            for (let i = 1; i <= 1000; i++) {

                let m = angular.copy(s);
                let tempList = s.data.pagination(i, 1000)
                nowCount += tempList.length;
                if (tempList.length === 0) {
                    break
                }
                m.data = tempList;
                m.userName = $scope.userName;

                if ($scope.isNoDeleted) {
                    m.isAppend = true;
                } else {
                    m.isAppend = i !== 1
                }

                $scope.uploadMessage = mainMessage + `当前进度 ${nowCount}/${totalCount}`
                !$scope.$$phase && $scope.$apply();
                await commonService.uploadTables(m)
            }


            $scope.uploadMessage = mainMessage + `上传完毕 `
            !$scope.$$phase && $scope.$apply();
        }

        // if (datas.find(o => o.tableName === 'strategy_business' || o.tableName === 'strategy_economy')) {
        //     $scope.uploadMessage = '系统检测到上传策略表，正在同步人员Od信息，时间较长，请稍等，勿关闭页面'
        //     await commonService.syncUserRegionOdConfig()
        // }

        $scope.uploadMessage = '本次上传完毕'
        !$scope.$$phase && $scope.$apply();


        toastr.info('数据同步成功！')
        // $uibModalInstance.close(datas);
    }

    function init() {
        function handleFile(e) {
            let files = e.target.files;
            if (files.length == 0) {
                return
            }
            let f = files[0];
            let reader = new FileReader();
            let name = f.name;
            reader.onload = function (e) {
                let data = e.target.result;
                let workbook = {}
                if (name.indexOf('csv') !== -1) {
                    let csvJson = []
                    let rows = data.split('\r\n');
                    let fields = rows[0].split(',').map(o => {
                        return o.replaceAll('"', '')
                    })
                    rows.removeAt(0)

                    rows.forEach(r => {
                        let tempRow = {}
                        let d = r.split(',')
                        fields.forEach((f, i) => {
                            tempRow[f] = d[i]
                        })
                        csvJson.push(tempRow)
                    });
                    let sheetName = ''
                    if (name.indexOf('_') > 0) {
                        sheetName = name.split('_').slice(0, 2).join('_')
                    }

                    workbook = {
                        SheetNames: [sheetName],
                        Sheets: {},
                        Props: {}
                    };
                    workbook.Sheets[sheetName] = XLSX.utils.json_to_sheet(csvJson)


                } else {
                    workbook = XLSXStyle.read(data, {type: 'binary'});
                }


                $scope.data = workbook.Sheets;
                loadFieldMap(workbook)

            };
            reader.readAsBinaryString(f);

        }

        $('#fileUpload').bind('change', handleFile);
    }

    function loadFieldMap(workbook) {
        let sheets = []
        Object.keys(workbook.Sheets)
            .forEach(o => {
                let sheet = {name: o, value: o, cols: [], selected: false}
                //检查第一行有没有数据
                if (workbook.Sheets[o]['A1'] === undefined) {
                    return
                }


                if (tableMap[o]) {
                    sheet.value = tableMap[o].tableName || o
                    sheet.idRules = tableMap[o].idRules || []

                } else {
                    sheet.idRules = []
                }

                //获取最大的行数
                let ref = workbook.Sheets[o]['!ref']
                try {
                    let refList = ref.split(':')
                    if (refList.length === 1) {
                        sheet.rowCount = ref.split(':')[0].replace(/[^0-9]/ig, "");
                    } else {
                        sheet.rowCount = ref.split(':')[1].replace(/[^0-9]/ig, "");
                    }
                } catch (e) {
                    debugger;
                }


                let i = 1;
                while (true) {
                    let key = i.toLetter() + '1'
                    let value = workbook.Sheets[o][key]
                    if (value === undefined) {
                        break;
                    } else {

                        let col = {
                            name: value.v,
                            key: i.toLetter(),
                            value: value.v,
                            selected: true
                        }

                        if (tableMap[o]) {
                            let colMap = tableMap[o].cols.find(c => c.name === col.name)
                            if (colMap) {
                                col.value = colMap.value;
                                col.type = colMap.type;
                            }
                        }


                        sheet.cols.push(col)
                        if (col.name === "经济舱舱位极差") {
                            col.unitValue = true;
                            let c = angular.copy(col);
                            c.unitValue = false;
                            c.name = "经济舱舱位极差单位"
                            c.value = c.value + 'Unit'
                            c.unit = 'CNY';
                            sheet.cols.push(c)
                        }
                    }
                    i++;
                    if (i === 100) {
                        break;
                    }
                }
                sheets.push(sheet)

            })
        sheets = sheets.sort((a, b) => {
            return a.cols.length - b.cols.length
        })
        $scope.sheets = sheets;
        $scope.isCanUpload = true;
        !$scope.$$phase && $scope.$apply();
    }


    function trans() {
        let r = {}
        let s = JSON.parse(localStorage.getItem('tableMap'))
        Object.keys(s).forEach(sheetName => {
            let sheet = s[sheetName]
            let cols = Object.keys(sheet.cols).map(
                c => {
                    return {
                        "name": c,
                        "type": "String",
                        "value": sheet.cols[c]
                    }
                }
            )

            r[sheetName] = {
                tableName: sheet.tableName,
                idRules: sheet.idRules,
                cols
            }
        })
        let str = JSON.stringify(r)
        localStorage.setItem('tableMap', str)
    }
}

function updatePasswordModalInstanceCtrl($scope, $rootScope, $location, $timeout, $uibModalInstance, basicService, authService) {

    let pattern = new RegExp($rootScope.systemConfig.passWord.regex);
    let passwordRegexName = $rootScope.systemConfig.passWord.regexName;
    $scope.user = authService.getAuthorizedUser();
    $scope.passWord = '';
    $scope.passWord2 = '';

    $scope.passWordChange = function (field) {
        if (field === 'passWord2') {
            $scope.message2 = '';
            if ($scope.passWord != $scope.passWord2) {
                $scope.message2 = '两次密码不一致！'
            }
        } else {
            $scope.message1 = '';
            //判断密码强度
            if (!pattern.test($scope.passWord)) {
                $scope.message1 = passwordRegexName;
            }

        }
    }


    $scope.savePassword = function () {
        if ($scope.message2 || $scope.message1) {
            return;
        }

        $rootScope.confirmation($scope, '确认修改密码？', '修改密码后，需要重新登录<br>如忘记密码，可以向系统管理申请重置密码', async function () {
            await basicService.updatePassword($scope.user.userAccount, md5($scope.passWord))

            $uibModalInstance.close();
        })

    }
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

function confirmationModalInstanceCtrl($scope, $sce, $uibModalInstance, authService, $location, targetScope, confirmAction, title, isAllowClose, confirmMessage) {

    $scope.isAllowClose = isAllowClose;
    $scope.targetScope = targetScope;
    $scope.confirmAction = confirmAction;
    $scope.title = title;
    $scope.confirmMessage = $sce.trustAsHtml(confirmMessage);
    $scope.confirm = function () {
        $scope.targetScope.$eval($scope.confirmAction);
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

angular
    .module('piApp')
    .controller('defaultCtrl', defaultCtrl)
    .controller('logoutCtrl', logoutCtrl)
    .controller('logoutModalInstanceCtrl', logoutModalInstanceCtrl)
    .controller('translateCtrl', translateCtrl)
    .controller('saveConfirmationModalInstanceCtrl', saveConfirmationModalInstanceCtrl)
    .controller('deleteConfirmationModalInstanceCtrl', deleteConfirmationModalInstanceCtrl)
    .controller('scenarioShiftStaffModalInstanceCtrl', scenarioShiftStaffModalInstanceCtrl)
    .controller('updatePasswordModalInstanceCtrl', updatePasswordModalInstanceCtrl)
    .controller('uploadModalInstanceCtrl', uploadModalInstanceCtrl)
    .controller('confirmationModalInstanceCtrl', confirmationModalInstanceCtrl)
;
