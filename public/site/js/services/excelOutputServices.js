function excelOutputServices($http, $timeout, $cookies, $q, $filter) {


    //保存
    function saveAs(obj, fileName) {
        const a = document.createElement('a');
        a.download = fileName || '下载';
        a.href = URL.createObjectURL(obj);
        a.click();
        setTimeout(() => {
            URL.revokeObjectURL(obj);
        }, 100);
    };

    //字符串转字符流
    function s2ab(s) {
        let buf = new ArrayBuffer(s.length);
        let view = new Uint8Array(buf);
        for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    };


    function exportFareAutoTemplate($scope, datas) {
        $scope.fareAutoTemplateData = datas;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
        $timeout(function () {
            let workbook = XLSX.utils.table_to_book(document.getElementById('fareAutoTemplateData'), {raw: true});
            outFareAutoTemplate(workbook)
        })


        function outFareAutoTemplate(workbook) {

            let title = 'Reactive自动跟进运价_' + new Date().format('yyyyMMddhhmmss')
            let colRemRat = 45 / 6;
            let cols = [];
            for (let i = 0; i < 18; i++) {
                if (i < 16) {
                    cols.push(9)
                } else {
                    cols.push(18)
                }
            }


            let colWidth = cols.map(o => {
                return {wpx: o * colRemRat}
            });
            workbook.Sheets.Sheet1['!cols'] = colWidth;

            loadCellStyle(workbook);

            const workbookOut = XLSXStyle.write(workbook, {
                bookType: 'xlsx',
                bookSST: false,
                type: 'binary'
            });
            saveAs(new Blob([s2ab(workbookOut)]), title.replace(/ /g, '') + '.xlsx')


            function loadCellStyle(workbook) {
                workbook.Sheets.Sheet1['!margins'] = {
                    bottom: 0.75,
                    footer: 0.3,
                    header: 0.3,
                    left: 0.7,
                    right: 0.7,
                    top: 0.75
                }


                Object.keys(workbook.Sheets.Sheet1).forEach(o => {
                    if (o.indexOf('!') !== -1) {
                        return
                    }

                    let col = o.toString()[0];
                    let rowIndex = parseInt(o.replace(col, ''));

                    if (rowIndex === 1 && (col === "H" || col === "K")) {
                        workbook.Sheets.Sheet1[o].s = getCellStyle('tip');
                    }
                    if (rowIndex === 2) {
                        workbook.Sheets.Sheet1[o].s = getCellStyle();
                    }

                })


                function getCellStyle(type) {
                    type = type || 'cell';

                    let defaultFont = {
                        name: 'Verdana', sz: 10, bold: false, color: {rgb: "003bf6"}
                    };
                    let alignment = {
                        vertical: 'center',
                        horizontal: 'center'
                    };
                    let style = {
                        cell: {
                            font: defaultFont,
                            alignment,
                            border: {
                                top: {
                                    style: 'thin', color: '000000'
                                },
                                bottom: {
                                    style: 'thin', color: '000000'
                                },
                                right: {
                                    style: 'thin', color: '000000'
                                },
                                left: {
                                    style: 'thin', color: '000000'
                                }
                            }
                        },
                        tip: {
                            fill: {
                                fgColor: {rgb: "ffff00"}
                            },
                            font: {
                                name: '宋体', sz: 11, bold: false, color: {rgb: "000000"}
                            },
                            alignment,
                            border: {
                                top: {
                                    style: 'thin', color: '000000'
                                },
                                bottom: {
                                    style: 'thin', color: '000000'
                                },
                                right: {
                                    style: 'thin', color: '000000'
                                },
                                left: {
                                    style: 'thin', color: '000000'
                                }
                            }
                        },
                    }
                    return style[type];
                }

            }


        }
    }

    return {
        exportFareAutoTemplate
    }
}

angular
    .module('piApp')
    .factory('excelOutputServices', excelOutputServices);




