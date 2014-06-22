var cookieParser = require("cookie-parser");
var ejsLayouts = require('express-ejs-layouts');
var expressLayouts = require('express-ejs-layouts')
var ejsEngine = require('ejs-locals');
var connect = require("connect");


var config = {
    development: {
        PORT: 2020,
        DEBUG_LEVEL: "dev"
    },
    production: {
        PORT: 2020,
        DEBUG_LEVEL: "dev"
    }
}

module.exports = function(express, app, rootDir) {

    // ========= Set config =======
    if(!~Object.keys(config).indexOf(app.get("env"))) {

        console.error("Undefined environment, fallback to development.");
        app.set("env", "development");
    }

    app.set("config", config[app.get("env")]);
    app.set("startTime", Date.now() );

    // ========= Config express ========
    app.use(express.static('./public'));
    app.use(cookieParser());
    // app.use(connect.logger( app.get("config").DEBUG_LEVEL));

    // app.use(expressLayouts);
    app.engine('html', ejsEngine);
    app.use(ejsLayouts);


    // all environments
    app.set('port', process.env.PORT || app.get("config").PORT);
    app.set('view engine', 'html');
    app.set('views', './view');
    app.set("layout", "frame");

    return app.get("config");
}