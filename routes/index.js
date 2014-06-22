module.exports = function(app) {

    var API = require("../modules/SocketApi")();
    var zip = require('express-zip');

    app.get("/", function(req, res) {

        res.render("index");
    });

    app.get("/getArchive/:id", function(req, res) {

        var id = req.params.id || '0';

        API.checkCode(id, function(exists) {

            if (!exists)
                return res.render("archiveNotFound");

            API.getFileList(id, function(files) {

                if (! files)
                    return res.render("archiveDamaged");

                res.zip(files, "YourCoolSongs.zip");
            });
        });

        return false;
    });


    app.get('*', function(req, res) {

        res.status(404);
        res.render("error404");
    });
};