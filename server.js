let DEFAULT_PORT = 3368;
let express = require('express');
let app = express();                               // create our app w/ express
let morgan = require('morgan');             // log requests to the console (express4)
let bodyParser = require('body-parser');    // pull information from HTML POST (express4)
let methodOverride = require('method-override'); // simulate DELETE and PUT (express4)



app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use("/resources", express.static(__dirname + '/resources'));
app.use("/dist", express.static(__dirname + '/dist'));
app.use("/modules", express.static(__dirname + '/node_modules'));
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser({"limit": '5mb'}));
app.use(bodyParser.urlencoded({'extended': 'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
app.use(methodOverride());

// global.console = {
//     log: function (message) {
//         debugger;
//     }
// }
global.rootRequire = function (name) {
    return require(__dirname + '/' + name);
}

// routes ==================================================
require('./api/local-api')(app);

// pass our application into our routes
app.get('*', function (req, res) {

    let verison = process.argv[2];
    if (verison) {
        if (verison == 'prod') {
            res.sendFile(__dirname + '/dist/index.html');
        }
        if (verison == 'build') {
            res.sendFile(__dirname + '/build/index.html');
        }
        return;
    }

    res.sendFile(__dirname + '/public/site/index.html');

});

let server = app.listen(DEFAULT_PORT, function () {
    console.log("App listening on port " + DEFAULT_PORT);
});


server.timeout = 600000;

exports = module.exports = app;
