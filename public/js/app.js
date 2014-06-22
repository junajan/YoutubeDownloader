var Downloader = function() {

    var self = this;
    var socket = io(window.location.href);
    this.list = [];

    // console.log alias
    function cl(c, d) {

        console.log(c, d || null);
    }

    // test error 
    function te(cb) {
        return function(data, c) {

            if (data.err)
                return alert(data.err);

            cb(data, c);
        }
    }

    // fetch playlist from youtube data api
    this.doMagic = function() {

        $("#thankYouMsg").hide();
        $("#downloadArea").hide();

        cl("Fetching playlist URL from server");

        var url = $("#in").val();
        if (url == "")
            return alert("Fill the input box first ;-)");

        socket.emit('getList', {
            url: url
        });
    }

    // clear playlist
    this.clearList = function() {

        self.list = [];
        $(".list ul").html("");
    }

    // check song to download
    this.selectSong = function(id) {

        $("#" + id).addClass("selected");
        $("#" + id).animate({
            backgroundColor: '#18b86e'
        }, "fast");
    }

    // uncheck song to download
    this.deselectSong = function(id) {

        $("#" + id).removeClass("selected");
        $("#" + id).animate({
            backgroundColor: '#EEEEEE'
        }, "fast");
    }

    // add triggers to elements
    this.addTrigger = function(id) {

        $("#" + id).unbind("click");

        $("#" + id).click(function() {
            var obj = $(this);

            if (obj.hasClass("selected")) {

                self.deselectSong(id);

            } else {

                self.selectSong(id);
            }
        });
    }

    // when download started .. show some text
    this.downloadStarted = function(res) {

        if(res.res === true) {

            $("#downloadArea").html("Download started.. (downloading "+ res.count + " files) ... <span id='dwnlPercent'>0</span>%");
            $("#downloadArea").fadeIn();
        }
    }

    // when download finished, show download link
    this.setDownloadLink = function(data) {

        var text = $("#downloadArea").html();
        var link = "/getArchive/"+data.id;

        $("#downloadArea").html(text + "<br />Download has finished.. and your playlist is <a id='thankYou' target='_blank' href='"+link+"'><b>here</b></a> (but only for 30 minutes).");
        $("#thankYou").click(function() {

            $("#thankYouMsg").fadeIn();
        });
    }

    // when download progress event.. show percentage
    this.setDownloadProgress = function(data) {

        if(data.err)
            return alert(data.err);

        $("#dwnlPercent").html(data.percent);
    }

    // when selected songs, start download
    this.fetchSongs = function() {

        var out = [];

        $(".list .selected").map(function(i, item) {
            out.push($(item).attr("id"))
        });

        if(! out.length )
            return alert("Select some songs first.. ");

        socket.emit("fetchSongs", out, te(self.downloadStarted));
    }

    // fill the list
    this.setList = function(data) {

        cl("Receiving data!", data);

        self.clearList();
        self.list = data.res;

        $(".list").fadeIn();
        var delayInc = 100;
        var delay = 0;

        data.res.forEach(function(item) {

            var img = "http://img.youtube.com/vi/" + item.id + "/mqdefault.jpg";
            var link = "http://youtu.be/" + item.id;

            // var html = "<li class='hidden' id='"+item.id+"'><img src='"+img+"' alt='' title='"+item.title+"' /></br /><a href='"+link+"' target='_blank'>"+item.title.trunc(70)+"</a></li>";
            var html = "<li class='hidden' id='" + item.id + "'><img src='" + img + "' alt='' title='" + item.title + "' /></br /><div>" + item.title.trunc(50) + "</div></li>";
            $(".list ul").append(html);
            self.addTrigger(item.id);
            self.selectSong(item.id);

            setTimeout(function() {
                $("#" + item.id).fadeIn();
            }, delayInc * delay++);
        });
    }

    // nowthing special
    this.downloadError = function(res) {
    }

    socket.on('downloadProgress', this.setDownloadProgress);
    socket.on('downloadError', te(this.downloadError));
    socket.on('downloadLink', te(this.setDownloadLink));
    socket.on('list', te(this.setList));
}

$(document).ready(function() {

    var DOWN = new Downloader();

    
    $("#in").onEnterKey(DOWN.doMagic);
    $("#magicButton").click(DOWN.doMagic);
    $("#fetchSongs").click(DOWN.fetchSongs);
    // $("#magicButton").click();
});