//fs ====================================

let userService = require('../app/services/userService');
let basicService = require('../app/services/basicService');
let commonService = require('../app/services/commonService');
let util = require('../app/utils/util');
const settings = require('../config/settings');

module.exports = function (app) {
    util.init()
    let allowCrossDomain = function (req, res, next) {
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    }
    app.use(allowCrossDomain);

    let authorization = function (req, res, next) {

        let noAuthorUrls = ['transToMainExpense', 'login', 'mergeProjectlines']
        console.log('checkAuthorization')
        let url = req.url;
        let skip = noAuthorUrls.find(o => {
            return url.indexOf(o) >= 0
        })
        if (skip) {
            next();
            return;
        }

        next();

    }

    app.use(authorization);

    userService.apiInit(app);
    commonService.apiInit(app);
    basicService.apiInit(app);


};
