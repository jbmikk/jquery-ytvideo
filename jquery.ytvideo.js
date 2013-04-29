(function( $ ){
	var each = function(callback) {
		return function() {
			var _args = arguments;
			return this.each(function(){
				callback.apply( this, _args);
			});
		}
	}

	var apiLoaded = false;
	var apiLoading = false;
	var waiting = [];

	var loadAPI = function() {
		if(!apiLoaded && !apiLoading) {
			// This code loads the IFrame Player API code asynchronously.
			var tag = document.createElement('script');
			tag.src = "//www.youtube.com/iframe_api";
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
			apiLoading = true;
		}
	}

	var onAPIReady = function(callback) {
		if(apiLoaded)
			callback();
		else {
			waiting.push(callback);
		}
	}

	onYouTubeIframeAPIReady = function() {
		apiLoaded = true;
		apiLoading = false;
		$.each(waiting, function(i, callback) {
			callback();
		});
		waiting = [];
	}

	var methods = {
		init : each(function( options ) {
			var $this = $(this),
				data = $this.data('ytvideo');

			var conf = $.extend({
				videoId: ''
			}, options);
				  
			// If the plugin hasn't been initialized yet
			if ( ! data ) {
				$this.data('ytvideo', {
					conf: conf,
					waitingPlayer: []
				});
				data = $this.data('ytvideo');
				loadAPI();
				onAPIReady(function() {
					data.player = new YT.Player($this[0], {
						height: '100%',
						width: '100%',
						playerVars: {
							wmode: 'transparent',
							version: 3,
							frameborder: 0,
							autohide: 1,
							showinfo: 0,
							modestbranding: 1
						},
						events: {
							'onReady': function() {
								data.playerReady = true;
								$.each(data.waitingPlayer, function(i, callback) {
									callback();
								});
							},
							'onStateChange': function(e) {
								switch(e.data) {
									case 0:
										$this.trigger('end');
										break;
								}
							}
						}
					});
				});
			}
			$this.ytvideo('play');
		}),

		destroy : each(function( ) {
			var $this = $(this),
				data = $this.data('ytvideo');

			// Namespacing FTW
			//$(window).unbind('.ytvideo');
			$this.unbind('.ytvideo');
			$this.removeData('ytvideo');
		}),

		playerReady: each(function(callback) {
			var $this = $(this),
				data = $this.data('ytvideo');
			if(data.playerReady) {
				callback();
			} else {
				data.waitingPlayer.push(callback);
			}
		}),

		play: each(function( ) {
			var $this = $(this),
				data = $this.data('ytvideo');
			$this.ytvideo('playerReady', function() {
				data.player.loadPlaylist([data.conf.videoId], 0, 0, 'medium');
			});
		})
	};

	$.fn.ytvideo = function( method ) {
    
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.ytvideo' );
		}    
	};
})( jQuery );
