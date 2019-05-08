let permissionList = {
    "APPLY": {
        "read": ["APPROVER", "USER"],
        "modify": ["APPROVER", "USER"],
        "delete": ["APPROVER", "USER"],
    },
    "APPROVE": {
        "read": ["APPROVER"],
        "modify": ["APPROVER"],
        "delete": ["APPROVER"],
    },
    "FINANCE": {
        "read": ["ACCOUNTANT"],
        "modify": ["ACCOUNTANT"],
        "delete": ["ACCOUNTANT"],
    },
    "REPORT": {
        "read": ["ACCOUNTANT", "USER", "APPROVER"],
    },
    "ADMIN": {
        "read": ["ADMIN"],
        "modify": ["ADMIN"],
        "delete": ["ADMIN"],
    }
};

//载入静态资源
const commonRequre = function (piAppRequire, otherReqire) {
    let req = [
        {
            name: 'piApp',
            files: [
                'site/js/controllers/baseCtrl.js',
                'site/js/controllers/menuCtrl.js',
            ]
        }
    ];
    if (piAppRequire) {
        req[0].files.concat(piAppRequire);
    }

    if (otherReqire) {
        req.concat(otherReqire)
    }

    return req;
}

//弹窗插件
const alertRequire = {
    name: 'oitozero.ngSweetAlert',
    files: ['resources/js/plugins/sweetalert/angular-sweetalert.min.js']
};

function normalFiles(fileList) {
    let files = [
        'site/js/services/userServices.js',
        'site/js/filter/filter.js',
    ]
    if (fileList && fileList.length && fileList.length != 0) {
        files = files.concat(fileList)
    }
    return {
        name: 'piApp',
        files
    }
}

function norma2lFiles() {
    return {
        insertBefore: '#loadBefore',
        name: 'localytics.directives',
        files: [
            'resources/css/plugins/chosen/bootstrap-chosen.css',
            'resources/js/plugins/chosen/chosen.jquery.js',
            'resources/js/plugins/chosen/chosen.js',
            'resources/js/plugins/jsxlsx/xlsx.style.min.js',
            'resources/js/plugins/jsxlsx/xlsx.full.min.js'
        ]
    }
}


function config($stateProvider, $urlRouterProvider, $locationProvider, $ocLazyLoadProvider, IdleProvider) {
    $locationProvider.html5Mode(true);//启用html5模式
    // Configure Idle settings
    IdleProvider.idle(5); // in seconds
    IdleProvider.timeout(3600); // in seconds

    $ocLazyLoadProvider.config({
        // Set to true if you want to see what and when is dynamically loaded
        debug: false
    });
    //otherLogin
    $urlRouterProvider.otherwise(function ($injector) {


        let $state = $injector.get('$state');
        $state.go('basic.sendEmail');
    });


    function loadBasic($stateProvider) {
        let basisList = ['emptyFieldList', 'countryDirectionCode', 'areaCode', 'tariff', 'currency', 'exchangeRate']
        basisList.forEach(o => {
            loadNormal($stateProvider, 'basic', o)
        })
    }

    function loadNormal($stateProvider, path, name) {
        $stateProvider.state(path + '.' + name, {

            url: "/" + name,
            templateUrl: "site/views/" + path + "/" + name + ".html",
            data: {pageTitle: name, access: {category: "BASIC", isFree: true}},
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([

                        {
                            name: 'piApp',
                            files: [
                                'site/js/controllers/' + path + '/' + name + 'Ctrl.js',
                                'site/js/directives/editable.js',
                            ]
                        },
                        norma2lFiles(),
                        normalFiles(),
                        alertRequire
                    ]);
                }
            }

        })

    }

    $stateProvider
        .state('login', {
            url: "/login",
            templateUrl: "site/views/login.html",
            data: {pageTitle: 'Login', specialClass: 'gray-bg', access: {isFree: true}},
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            name: 'piApp',
                            files: [

                                'site/js/controllers/loginCtrl.js',
                                'site/css/dutyTools.css'
                            ]
                        }
                    ]);
                }
            }
        })
        .state('basic', {
            abstract: true,
            url: "/basic",
            templateUrl: "site/views/common/content.html",
            data: {pageTitle: '基础信息维护', access: {category: "BASIC", isFree: false}},
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load(commonRequre());
                }
            }

        })


    loadNormal($stateProvider, 'basic', 'sendEmail')
    loadNormal($stateProvider, 'basic', 'addressManange')
}

function stateChangeListener($rootScope, $state, Idle, $location, authService, commonService) {
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

        // if (toState.url !== "/login") {
        //     let user = authService.getAuthorizedUser()
        //     if (!user) {
        //         $state.go('login')
        //         event.preventDefault()
        //         return
        //     } else {
        //         authService.keepAccountAlive();
        //     }
        //     if (!user.role.isAdmin && user.role.rolePages.find(o => o.url === toState.name) === -1) {
        //         $state.go(user.role.rolePages[0].url)
        //         event.preventDefault()
        //         return;
        //     }
        //
        //     let systemConfig = commonService.getLocalConfig()
        //     if (!systemConfig) {
        //         $state.go('login')
        //         event.preventDefault()
        //         return
        //     }
        //
        //
        // }


    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        // if (toState.url != "/login") {
        //     Idle.watch();
        //     authService.refreshToken();
        //
        //     $rootScope.$on('IdleTimeout', function () {
        //         authService.removeToken();
        //         $rootScope.$apply(function () {
        //             $location.path("/login");
        //         });
        //     });
        // }
    });
}

angular
    .module('piApp')
    .factory('tokenInjector', function ($rootScope, $cookies) {
        let injector = {
            request: function (config) {
                let token = $cookies.get('access-token');
                config.headers["authorization"] = token;
                return config;
            }
        };
        return injector;
    })


function injectorConfig($httpProvider) {
    $httpProvider.interceptors.push('tokenInjector');
}


angular
    .module('piApp')
    .config(config)
    .config(injectorConfig)
    .run(function ($rootScope, $state) {
        $rootScope.$state = $state;
    })
    .run(stateChangeListener)
    .run(function (permissionServices) {
        permissionServices.setPermissions(permissionList)
    });
