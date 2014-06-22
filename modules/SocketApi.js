var _ = require("underscore");
var async = require("async");
var md5 = require('MD5');
var fs = require('fs');
var path = require('path');
var dir = require('node-dir');
var EasyZip = require('easy-zip').EasyZip;

var YoutubeApi = require("./YoutubeApi");

var DIR = process.cwd()+"/public/upload/";  // upload dir
var LIMIT_CONCURRENT = 10;                  // max download concurrency

var SocketApi = function() {
    var self = this;
    
    // init server
    self.init = function() {
        console.log("Loading SocketApi API");

        // remove all downloaded playlists
        YoutubeApi.deleteAll(DIR, function() {
            YoutubeApi.createDir(DIR);
        });
    }

    // call middleware
    this.call = function(f, evName, socket, authOnly) {

        return function(d, cb) {

            if (_.isFunction(d)) {

                cb = d;
                d = null;
            }

            if (!_.isFunction(cb))
                cb = function() {}

            console.log(("EVENT: "+evName).green, JSON.stringify(d));
            if (_.isFunction(f))
                f(d, cb, socket, evName);
        }
    }

    // get songs in playlist
    this.getList = function(data, cb, socket) {

        if (! data.url)
        	return cb({res: "You didn't give me a link ;-)"});

        // send work in progress
        cb({res:true});
        
        // fetch url
        YoutubeApi.fetchList( data.url, function(err, res) {

            socket.emit("list", {err: err, res: res});
        });
    }

    // number to percentage
    this.getPercent = function(c, max) {

        return Math.min(100, Math.ceil(c * 100 / max));
    }

    // download youtube sonsgs
    this.startDownloading = function(list, socket) {
        // progress bar - (dwnl start + stop) * songs_count + createFolder + (start + end zip folder)
        var MAX = list.length * 2 + 1 ;
        var countProgress = 0;
        var id = md5(JSON.stringify(list));
        var LOC = DIR+id;

        // increment and send new progress
        function incProgress( i ) {

            countProgress += i || 1;
            socket.emit("downloadProgress", {percent: self.getPercent(countProgress, MAX)});
        }

        // download one song
        function downloadSong (item, done) {
                
            console.log("Downloading song: ", item );
            incProgress();

            YoutubeApi.downloadSong(LOC+"/", item, function(err, res) {

                if(res == 0)
                    socket.emit("youtubeError", {id: item});

                incProgress();
                done(err, res);
            });

        }
        
        // create archive folder
        YoutubeApi.createDir(LOC, function(err) {

            if(err) {

                // if it already exists..
                if(err.code == "EEXIST"){

                   incProgress(110910909);
                   return socket.emit("downloadLink", {id: id});
                }

                return socket.emit("downloadError", "Error while creating folder.");
            }

            // download all songs, max 10 in one time
            async.eachLimit(list, LIMIT_CONCURRENT, downloadSong, function(err, res) {
                incProgress();

                // send download code
                socket.emit("downloadLink", {id: id});

                // and schedule deletion
                setTimeout(YoutubeApi.deleteAll, 1000 * 60 *30, DIR+id);
            });
        });
    }

    // download songs on server
    self.fetchSongs = function(data, cb, socket ) {
       
        if(! data.length)
            return cb({err: "Choose some songs first.."});
        
        cb({res:true, count: data.length});
        self.startDownloading(data, socket);
    }

    // check if code exists
    this.checkCode = function(id, cb) {

        fs.exists(DIR+id, cb);
    }

    // get files in archive (folder)
    this.getFileList = function(id, cb) {

        dir.files(DIR+id, function(err, files) {
            
            files = files.map(function(item) {
                return {path: item, name: path.basename(item)};
            });
            cb(files);
        });
    }

    self.init();
    return this;
}

// singleton
SocketApi.instance = null;
module.exports = function() {

    if (!SocketApi.instance)
        SocketApi.instance = new SocketApi();

    return SocketApi.instance;
}