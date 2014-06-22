var request = require("request");
var async = require("async");
var fs = require("fs");
var rimraf = require("rimraf");
var youtubedl = require('youtube-dl');

// reduce json feed from youtube api
function reduceJsonFeed(arr) {

    return {
        title: arr.title.$t,
        id: arr["media$group"]["yt$videoid"].$t
    };
}

// will return list of songs from playlist
function getJsonList(code, cb) {

    // url of playlist JSON feed
    var url = "http://gdata.youtube.com/feeds/api/playlists/" + code + "?v=2&alt=json";

    request({
            url: url,
            json: true
        },
        function(error, response, body) {

            if (!error && response.statusCode === 200 && body.feed && body.feed.entry)
                return cb(null, body.feed.entry.map(reduceJsonFeed));

            return cb("Invalid playlist code.");
        });
}

// get list of songs in playlist
exports.fetchList = function(url, done) {

    // parse youtube playlist code
    var code = url.match(/list=([^&]*)/i);

    if (!code)
        return cb("This is not valid playlist link.");

    getJsonList(code[1], done);
}

// delete all archives
exports.deleteAll = function(dir, cb) {

    rimraf(dir, cb || function() {});
}

// create archive folder
exports.createDir = function(dir, cb) {

    fs.mkdir(dir, cb || function() {});
}

// download one song from youtube
exports.downloadSong = function(dir, id, cb) {

    var video = youtubedl('http://www.youtube.com/watch?v='+id,['--max-quality=18'],{ cwd: dir });
    var file = "";

    video.on('error', function(err) {

        console.log("This video is not available to be downloaded", id);
        cb(false, 0);
    });

    video.on('info', function(info) {

        video.pipe(fs.createWriteStream(file = dir+info.filename));
    });
    
    video.on("end", function() {
        cb(false, file);
    });
}