function basicService($http, $q) {

    let mainUrl = "/api/db/baisc/";

    let that = {
        updateStrategyApply: function (_id, applyId, tableName) {
            return $http.post(mainUrl + 'updateStrategyApply', {_id, applyId, tableName})
        },

        sendEmail: function (formData) {

            let deferred = $q.defer();
            $.ajax({
                type: "POST", // 数据提交类型
                url: mainUrl + 'sendEmail', // 发送地址
                data: formData, //发送数据
                async: true, // 是否异步
                processData: false, //processData 默认为false，当设置为true的时候,jquery ajax 提交的时候不会序列化 data，而是直接使用data
                contentType: false,
                success: function (data) {
                    deferred.resolve({
                        data: data
                    });
                }
            });
            return deferred.promise
        }


    }
    Object.keys(that).forEach(k => {
        if (that[k] === null) {
            that[k] = function (sm) {
                return $http.get(mainUrl + k, {params: sm});
            }
        }
    })


    return that
}

angular
    .module('piApp')
    .factory('basicService', basicService);

