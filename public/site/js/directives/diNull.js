angular
    .module('piApp')
    .directive("diNull", function () {
        return {
            restrict: "E",
            replace: true,
            template: ""
        };
    });

