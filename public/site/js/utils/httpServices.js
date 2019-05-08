function httpServices(authService, $http, $q){

    var httpAction = function(config, callbacks){
        var deferred = $q.defer();
        if(callbacks == undefined) callbacks = {};

        if(config != undefined){
            config["url"] += getJsessionId();
        }

        $http(config)
            .success(function(data){
                if(callbacks.success != undefined && typeof callbacks.success == 'function') {
                    $(document).one( "onCallbackSuccess", function( event, data ) {
                        callbacks.success(event, data);
                    });
                    $(document).trigger("onCallbackSuccess");
                }
                deferred.resolve({
                    data : data
                });
            })
            .error(function(msg, code){
                if(callbacks.error != undefined && typeof callbacks.error == 'function') {
                    $(document).one( "onCallbackError", function( event, data ) {
                        callbacks.error(event, data);
                    });
                    $(document).trigger("onCallbackError");
                }
                deferred.reject(msg);
            });

        return deferred.promise;
    }

    var getJsessionId = function(){
        return ";jsessionid=" + authService.getJSessionId();
    }

    return{
        httpAction: httpAction
    }
}

angular
.module('piApp')
.factory('httpServices', httpServices);

