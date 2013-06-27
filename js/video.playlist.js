_V_.PlaylistEngine = _V_.Class.extend({
    init: function (player, videos) {
        this.player = player;
        this.videos = videos;
        this.currentIndex = 0;
        this.lastIndex = 0;
         
        // Load track
        this.updateTrack();
        
        // set videos count - if <=1 - hide playlist buttons
        setVideosCount(this.videos.length);
        
        this.player.addEvent("fullscreenchange", function(){ 
        	if (this.isFullScreen == true) {
        		this.playlist.addClass("playlist-fullscreen");
        	}
        	else {
        		this.playlist.removeClass("playlist-fullscreen");
        	}
        });
        
    },

    play: function (index) {
        if (this.videos.length > 1) {
            this.setActiveNextButton();
            this.setActivePreviousButton();
            this.lastIndex = this.currentIndex;
            this.currentIndex = index;
            if (this.currentIndex >= (this.videos.length - 1)) {
                this.setInactiveNextButton();
                this.setActivePreviousButton();
            }
            if (this.currentIndex <= 0) {
                this.setInactivePreviousButton();
                this.setActiveNextButton();
            }
            this.updateVideo();
        } else {
            throw new Error("Playlist is empty");
        };
    },

    pause: function () {
        this.player.pause();
    },

    next: function () {
        if (this.currentIndex < (this.videos.length - 1)) {
            this.incrementCurrentIndex();
            this.updateVideo();
            // generate PDF list
            insertPdf(this.currentIndex);  
        }        
    },

    prev: function () {
        if (this.currentIndex >= 1) {
            this.decrementCurrentIndex();
            this.updateVideo();
            // generate PDF list
            insertPdf(this.currentIndex); 
        }
    },

    reload: function () {
        this.pause();
        this.player.load();
        var that = this;
        setTimeout(function () { that.player.play() }, 500);
    },

    incrementCurrentIndex: function () {
        this.setActivePreviousButton();
        this.lastIndex = this.currentIndex;
        this.currentIndex++;
        // DO NOT play first video when playlist reaches end
        if (this.currentIndex >= (this.videos.length - 1)) {
            this.setInactiveNextButton();
        };
    },

    decrementCurrentIndex: function () {
        this.setActiveNextButton();
        this.lastIndex = this.currentIndex;
        this.currentIndex--;
        if (this.currentIndex <= 0) {
            this.currentIndex = 0;
            this.setInactivePreviousButton();           
        };
    },
    
    setActiveNextButton: function () {
        var button = document.getElementById('playlist-next-button');
        button.className = 'playlist-next';
    },
    
    setInactiveNextButton: function () {
        var button = document.getElementById('playlist-next-button');
        button.className = 'playlist-next-inactive';
    },
    
    setActivePreviousButton: function () {
        var button = document.getElementById('playlist-previous-button');
        button.className = 'playlist-previous';
    },
    
    setInactivePreviousButton: function () {
        var button = document.getElementById('playlist-previous-button');
        button.className = 'playlist-previous-inactive';
    },

    updateVideo: function () {
        this.updateVideoSrc();
        this.reload();
    },

    updateVideoSrc: function () {
        var active = this.player.playlist.videoListBody.childNodes[this.lastIndex];
        var current = this.player.playlist.videoListBody.childNodes[this.currentIndex];

        active.className = active.className.replace(' active', '');
        current.className += " active";
        this.player.playlist.setTitle(this.player.options.playlist[this.currentIndex].title);
        this.player.playlist.setCurrent(this.currentIndex + 1);

        var sources = this.videos[this.currentIndex].sources;
        // Load track
        this.updateTrack();
        // Update video
        this.player.src(sources);
        this.player.triggerReady();
    },

    // Update track
    updateTrack: function () {
        if (this.player.options.playlist[this.currentIndex].track !== undefined && this.player.textTracks[0] !== undefined) {
            $(".playlist-video-title").autoEllipsisText({width:450});
            var track = this.player.textTracks[0];
            // update src
            track.src = this.player.options.playlist[this.currentIndex].track;
            // reset cues
            track.cues = [];
            // change status
            track.readyState = 0;
            // load new track
            track.load();  
        }
    }

});

_V_.Playlist = _V_.Component.extend({
    init: function (player, options) {
        this._super(player, options);
        // attach playlist to the player
        this.player.playlist = this;
        // play next video when current is ended
        this.player.addEvent("ended", this.proxy(this.next));
        // attach engine
        this.engine = new _V_.PlaylistEngine(this.player, this.videos);
        this.show();
    },

    play: function (index) {
        this.engine.play(index);
    },
    pause: function () { this.player.pause() },
    next: function () { this.engine.next() },
    prev: function () { this.engine.prev() },

    show: function () {
        this._super();
    },

    showPopup: function () {
        this.videoList.style.display = "block";
    },

    hidePopup: function () {
        this.videoList.style.display = "none";
    },

    createElement: function () {
        this.videos = this.getVideos();

        var el = this._super("div", { id: "playlist" });
        this.header = this._super("div", { className: "playlist-header" });
        this.buttons = this._super("div", { className: "playlist-buttons" });
        this.previousBtn = this._super("div", { id: "playlist-previous-button", className: "playlist-previous-inactive", title: "Previous" });
        this.currentLabel = this._super("div", { className: "playlist-current"});
        this.current = this._super("span", { className: "playlist-current-label", innerHTML: "1 of " + this.videos.length });
        this.nextBtn = this._super("div", { id: "playlist-next-button", className: "playlist-next", title: "Next" });
        this.title = this._super("div", { className: "playlist-video-title" });
        this.videoList = this._super("div", { className: "playlist-popup" });
        this.videoListBody = this._super("div", { className: "playlist-popup-body" });
        this.videoList.style.display = "none";

        _V_.addEvent(this.nextBtn, "click", _V_.proxy(this, this.next));
        _V_.addEvent(this.previousBtn, "click", _V_.proxy(this, this.prev));

        // render video titles
        for (i = 0; i < this.videos.length; i++) {
            var item = new _V_.PlaylistThumb(this.player, this.videos[i], i, this.videos[i].title)
            this.videoListBody.appendChild(item.el);
        };

        this.videoList.appendChild(this.videoListBody);
        this.currentLabel.appendChild(this.current);
        this.currentLabel.appendChild(this.videoList);
        this.buttons.appendChild(this.nextBtn);
        this.buttons.appendChild(this.currentLabel);
        this.buttons.appendChild(this.previousBtn);
        this.header.appendChild(this.title);
        this.header.appendChild(this.buttons);
        //el.appendChild(this.title);
        el.appendChild(this.header);
        this.setTitle(this.videos[0].title);

        return el;
    },

    setCurrent: function (currentNumber) {
      this.current.innerHTML = currentNumber + " of " + this.videos.length;
    },

    setTitle: function (value) {
        if (value === undefined) {
            // hide title block if value is undefined
            this.title.style.display = "none";
        }
        else {
            // update title block
            this.title.innerHTML = value;
        }
    },

    getVideos: function () {
        return this.player.options.playlist;
    }

});

_V_.PlaylistThumb = _V_.Component.extend({

    init: function (player, params, index, title) {
        this.params = params;
        this.index = index;
        this.title = title;
        this._super(player);

        _V_.addEvent(this.el, "click", _V_.proxy(this, this.onClick));
    },

    createElement: function () {
        // set class "active" for first button
        var isActive = this.index === 0 ? " active" : "";
        var title = this.title === undefined ? "" : (this.index + 1) + ". " + this.title;
        this.el = this._super("div", { className: "playlist-item" + isActive, innerHTML: title });
        return this.el;
    },

    onClick: function () {
        this.player.playlist.play(this.index);
        // generate PDF list
        insertPdf(this.index);
        hidePlaylist();
    },

    sources: function () {
        return this.params.sources;
    }

});

_V_.options.components.playlist = {};