function authService($cookies, $http) {

    //expire in 8 hour
    const expireLength = 30 * 24 * 60 * 60 * 1000;

    let  getAuthorizedUser = function () {
        let  existing_cookie_user = $cookies.get('userInfo');
        let  currentUser;
        if (existing_cookie_user) {
            currentUser = jQuery.parseJSON(existing_cookie_user)
        }
        return currentUser;
    }

    let  userAuthorize = function (item) {

        $cookies.put('userInfo', JSON.stringify(item), {'expires': getExpireDate()});
    }

    let  keepAccountAlive = function () {
        let  currentUserInfo = getAuthorizedUser();
        if (currentUserInfo != undefined) {
            $cookies.put('userInfo', JSON.stringify(currentUserInfo), {'expires': getExpireDate()});
        }
    }

    let  userInvalid = function () {
        $cookies.remove('userInfo');
    }

    let  getJSessionId = function () {
        return $cookies.get('jsessionid');
    }

    let  getToken = function () {
        return $cookies.get('access-token');
    }

    let  setToken = function (access_token) {
        return $cookies.put('access-token', access_token, {'expires': getExpireDate()});
    }

    let  removeToken = function () {
        $cookies.remove('access-token');
    }

    let  refreshToken = function () {
        return $cookies.put('access-token', $cookies.get('access-token'), {'expires': getExpireDate()});
    }

    let  getExpireDate = function () {
        let  expireDate = new Date();
        expireDate.setTime(expireDate.getTime() + expireLength);
        return expireDate.toGMTString();
    }

    function isHighLevelUser() {
        let  user = getAuthorizedUser();
        return user.roles.indexOf('APPROVER') >= 0 || user.roles.indexOf('ACCOUNTANT') >= 0
    }

    return {
        getAuthorizedUser,
        userAuthorize,
        userInvalid,
        keepAccountAlive,
        getJSessionId,
        setToken,
        getToken,
        removeToken,
        refreshToken,
        isHighLevelUser,
    }
}

angular
    .module('piApp')
    .factory('authService', authService);

