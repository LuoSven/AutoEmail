function layDateNg($timeout) {

    return {
        require: '?ngModel',
        restrict: 'A',
        scope: {
            ngModel: '='
        },
        link: function (scope, element, attr, ngModel) {

            $timeout(function () {
                var _date = null, _config = {};
                if (!attr.id) {
                    var id = `lay_date_${new Date().getTime()}`
                    $(element).attr('id', id)
                    attr.id = id;
                }
                // 初始化参数
                _config = {
                    elem: '#' + attr.id,
                    format: attr.format != undefined && attr.format != '' ? attr.format : 'YYYY-MM-DD',
                    max:attr.hasOwnProperty('maxDate')?attr.maxDate:'',
                    min:attr.hasOwnProperty('minDate')?attr.minDate:'',

                    // max:attr.hasOwnProperty('maxDate')?attr.maxDate:'',
                    // min:attr.hasOwnProperty('minDate')?attr.minDate:'',
                    done: function (value) {
                        scope.$apply(function () {
                            if(value){


                                setViewValue(value)
                            }
                        });

                    },

                    value:ngModel.$viewValue,
                    clear: function () {

                        setViewValue(null)

                    }
                };

                if (attr.layDate) {
                    var config = eval("(" + attr.layDate + ")");
                    Object.keys(config).forEach(o => {
                        _config[o] = config[o]
                    })
                }


                // 初始化
                _date = laydate.render(_config);


                // 模型值同步到视图上
                ngModel.$render = function () {
                    element.val(ngModel.$viewValue || '');
                };



                setViewValue(ngModel.$viewValue);

                // 更新模型上的视图值
                function setViewValue(value) {
                    // var val = element.val();
                    // console.log(value);


                    ngModel.$setViewValue(value);
                    element.val(value);
                }
            })

        }
    }
}

angular
    .module('piApp')
    .directive('layDate', layDateNg);
