function permissionServices($rootScope) {
    var permissionList;
    return {
        setPermissions: function(permissions) {
            console.log('permissionsChanged')
            permissionList = permissions;
            $rootScope.$broadcast('permissionsChanged')
        },
        hasPagePermission: function(roles, category) {
            return true;
            var pagePermission = permissionList[category];
            if(pagePermission){
                var hasPermission = false;
                for(var permission in pagePermission){

                    var currentPagePermissions = pagePermission[permission];
                    var intersection = currentPagePermissions.filter(function(v){ return roles.indexOf(v) > -1 })

                    if(intersection.length > 0){
                        hasPermission = true;
                        break;
                    }
                }
                return hasPermission;
            }else
                return false;
        },
        hasComponentPermission: function(roles, pageToCheck, permissionToCheck) {
            return true
            var pagePermission = permissionList[pageToCheck];
            if(pagePermission){
                if(!pagePermission[permissionToCheck]) return false;

                var hasPermission = false;
                if(roles && roles.length > 0){
                    for(var i in roles){
                        if(pagePermission[permissionToCheck].indexOf(roles[i]) > -1){
                            hasPermission = true;
                            break;
                        }
                    }
                }
                return hasPermission;
            }else
                return false;
        },
        getPermissions: function() {
            return permissionList;
        }
    };
}

//need http interceptor in the future


function hasPermission($rootScope, permissionServices){
    return {
        link: function(scope, element, attrs) {

            function toggleVisibilityBasedOnPermission() {
                var currentUser = $rootScope.loggedUser;

                // currentUser = {};
                // currentUser.userType = "normaluser";

                if(!currentUser) return false;
                var hasPermission = permissionServices.hasComponentPermission(currentUser.userType, $rootScope.$state.current.name, attrs.hasPermission);

                if(hasPermission)
                    element.show();
                else
                    element.remove();
            }
            toggleVisibilityBasedOnPermission();
            scope.$on('permissionsChanged', toggleVisibilityBasedOnPermission);
        }
    };
}

angular
    .module('piApp')
    .factory('permissionServices', permissionServices)
    .directive('hasPermission', hasPermission)
;