function sortable($window) {
    return {
        restrict: 'A',
        compile: function (element, attrs) {

            let $element = $(element);
            let data = attrs['sortableHeadData']
            let colName=$element()

            return function ($scope, element, attrs) {


            }

        }

        ,
    };
}


angular
    .module('piApp')
    .directive('sortableHead', sortable)
