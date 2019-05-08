let commonService = require('./commonService')


function login(userName, password, res) {

    res.json({access_token: 123, uid: 1, displayName: 'admin'});

}


function apiInit(app) {
    var mainUrl = '/api/db/user/'
    //登录
    app.post(mainUrl + 'login', function (req, res) {
        let username = req.body['userName'];
        let password = req.body['userPassword'];
        var isFake = req.headers.host === "localhost:8222"
        login(username, password, res, isFake);
    });
}


module.exports = {
    apiInit,
}
