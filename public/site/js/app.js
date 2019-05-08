(function () {
    angular.module('piApp', [
        'ngResource',
        'ngCookies',
        'ngSanitize',
        'ngStorage',
        'ui.router',                    // Routing
        'oc.lazyLoad',                  // ocLazyLoad
        'ui.bootstrap',                 // Ui Bootstrap
        'pascalprecht.translate',       // Angular Translate
        'ngIdle'                        // Idle timer
    ])
})();
