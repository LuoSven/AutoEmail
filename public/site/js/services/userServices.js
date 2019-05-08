function userServices($http, $cookies, $q, authService) {


    async function login(user) {

        user.userPassword = md5(user.userPassword)
        return await $http.post('/api/db/baisc/login', user)


    }

    var logout = function () {
        authService.removeToken();
        authService.userInvalid();

    }


    return {
        login,
        logout,
    }
}

angular
    .module('piApp')
    .factory('userServices', userServices);

