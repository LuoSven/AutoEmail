
//Default
function defaultCtrl($scope, $rootScope, $http, authService, $uibModal) {

    $scope.isAdmin = false;
    $scope.loggedUser = authService.getAuthorizedUser();
    if($scope.loggedUser){
        if($scope.loggedUser.roleId == 1) $scope.isAdmin = true;
    }else{
        $scope.loggedUser = {
            roleId: 2,
            firstName: "Guest",
            lastName: "User"
        };
    }

    //save confirmation
    $scope.saveConfirmation = function (targetScope, action) {
        $scope.modalInstance = $uibModal.open({
            templateUrl: '/resources/views/modal/save-confirmation-modal.html',
            controller: 'saveConfirmationModalInstanceCtrl',
            resolve: {
                confirmAction: function() {
                    return action;
                },
                targetScope : function() {
                    return targetScope;
                }
            }
        });
    }

    $rootScope.deleteConfirmation = function (targetScope, action) {
        $scope.modalInstance = $uibModal.open({
            templateUrl: '/resources/views/modal/delete-confirmation-modal.html',
            controller: 'deleteConfirmationModalInstanceCtrl',
            resolve: {
                confirmAction: function() {
                    return action;
                },
                targetScope : function() {
                    return targetScope;
                }
            }
        });
    }
}

//translateCtrl - Controller for translate
function translateCtrl($translate, $scope) {
    $scope.changeLanguage = function (langKey) {
        $translate.use(langKey);
    };
}

//logout
function logoutCtrl($scope, $uibModal){

    $scope.logoutConfirm = function () {
        $scope.modalInstance = $uibModal.open({
          templateUrl: '/resources/views/modal/logout-modal.html',
          controller: 'logoutModalInstanceCtrl'
        });
    }
}

function logoutModalInstanceCtrl ($scope, $uibModalInstance, authService, $location) {
    
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

angular
.module('piApp')
.controller('defaultCtrl', defaultCtrl)
.controller('logoutCtrl', logoutCtrl)
.controller('logoutModalInstanceCtrl', logoutModalInstanceCtrl)
.controller('translateCtrl', translateCtrl)
.controller('saveConfirmationModalInstanceCtrl', saveConfirmationModalInstanceCtrl)
.controller('deleteConfirmationModalInstanceCtrl', deleteConfirmationModalInstanceCtrl)
;
