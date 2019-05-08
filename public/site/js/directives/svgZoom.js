function svgZoom(){
    return {
        restrict: 'A',
        link: function(scope, element) {
            var panZoomTiger = svgPanZoom('#plane-route', {
                zoomEnabled: true,
                controlIconsEnabled: true,
                fit: true,
                center: true,
            });
        }
    };
}

/**
 *
 * Pass all functions into module
 */
angular
    .module('piApp')
    .directive('svgZoom', svgZoom)