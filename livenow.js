$(function() {
	function addCommas(number) {
		return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	
	var twitchLoaded = [];
	var hitboxLoaded = [];
	var errors = 0;
	
	var streams = [];
	
	function processGame(game) {
		streams[game.id] = [];
		
		// Add game header to table.
		var header = $('<tr/>', {
			id: 'livenow-game-' + game.id,
		}).hide().append($('<th/>', {
			colspan: 6
		}).html(game.name)).appendTo(table);
		
		// Call Twitch API.
		jQuery.getJSON('https://api.twitch.tv/kraken/streams?callback=?', {
			game: game.name
		}, function(data) {
			for (var i = 0; i < data.streams.length; i++) {
				var stream = data.streams[i];
				
				streams[game.id].push({
					url: stream.channel.url,
					logo: stream.channel.logo || 'http://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_50x50.png',
					name: stream.channel.display_name,
					thumb: stream.preview.small,
					desc: stream.channel.status,
					viewers: stream.viewers,
					platform: 'twitch'
				});
			}
		}).fail(function() {
			errors++;
		}).always(function() {
			twitchLoaded[game.id] = true;
			done++;
			checkDone(game, header);
		});
		
		// Call Hitbox API.
		if (game.hitbox) {
			jQuery.getJSON('http://api.hitbox.tv/media/live/list', {
				game: game.hitbox
			}, function(data) {
				for (var i = 0; i < data.livestream.length; i++) {
					var stream = data.livestream[i];
					
					streams[game.id].push({
						url: stream.channel.channel_link,
						logo: 'http://edge.sf.hitbox.tv' + stream.channel.user_logo_small,
						name: stream.channel.user_name,
						thumb: 'http://edge.sf.hitbox.tv' + stream.media_thumbnail,
						desc: stream.media_status,
						viewers: stream.media_views,
						platform: 'hitbox'
					});
				}
			}).fail(function(jqxhr) {
				if (jqxhr.responseText != 'no_media_found') {
					errors++;
				};
			}).always(function() {
				hitboxLoaded[game.id] = true;
				done++;
				checkDone(game, header);
			});
		} else {
			hitboxLoaded[game.id] = true;
			done++;
			checkDone(game, header);
		}
	}
	
	function checkDone(game, header) {
		if (twitchLoaded[game.id] && hitboxLoaded[game.id]) {			
			var gameStreams = streams[game.id];
			if (gameStreams.length > 0) {
				$('<th/>', {
					rowspan: gameStreams.length + 1
				}).append($('<img/>', {
					src: game.boxart || 'https://static-cdn.jtvnw.net/ttv-boxart/' + encodeURI(game.name) + '-52x72.jpg',
				})).prependTo(header);
			
				gameStreams.sort(function(a, b) { return a.viewers - b.viewers; });
				header.show();
				for (var i = 0; i < gameStreams.length; i++) {
					var stream = gameStreams[i];
					
					var thumb = $('<img/>', {
						src: stream.thumb,
						width: 80,
						height: 50
					});
					var fallback = '';
					switch (stream.platform) {
						case 'twitch':
							fallback = 'http://static-cdn.jtvnw.net/ttv-static/404_preview-80x50.jpg';
							break;
						case 'hitbox':
							fallback = 'http://www.hitbox.tv/static/img/live/no-tn.jpg';
							break;
					}
					
					if (fallback) {
						thumb.error(function() {
							thumb.attr('src', fallback);
						});
						thumb.css('background', 'url(' + fallback + ')');
						thumb.css('background-size', 'cover');
					}
					
					var a = $('<a/>', {
						href: stream.url
					});
					$('<tr/>').append(
						// Platform cell
						$('<td/>').append(
							$('<img/>', {
								src: 'logo/' + stream.platform + '.png',
								width: 50,
								height: 50
							}).css('border', 'none')
						).css('padding-right', '0'),
						// Logo cell
						$('<td/>').append(
							a.clone().append(
								$('<img/>', {
									src: stream.logo,
									width: 50,
									height: 50
								})
							)
						),
						// Name cell
						$('<td/>').append(
							a.clone().append(
								$('<strong/>').html(stream.name)
							)
						),
						// Thumbnail cell
						$('<td/>').append(
							a.clone().append(thumb)
						),
						$('<td/>').css('width', '100%').html(stream.desc),
						$('<td/>').append(
							$('<div/>').html(addCommas(stream.viewers)),
							'viewers'
						)
					).insertAfter(header);
				}
				active++;
			}
			
			updateStatus();
		}
	}


	function updateStatus() {
		var s = '';
		if (done == livenow_games.length * 2) {
			if (active <= 0) {
				s = 'No one is streaming right now.';
			}
			table.show();
		} else {
			s = 'Loading games... (' + Math.round((done * 100) / (livenow_games.length * 2)) + '%)';
		}
		if (errors > 0) {
			if (s) {
				s += '<br>';
			}
			s += errors + ' errors during loading. Some streams may not be shown.';
		}
		if (s) {
			status.html(s).show();
		} else {
			status.html(s).hide();
		}
	}
	
	var status;
	var table;
	var done = 0;
	var active = 0;
	var container = $('#livenow-container');
	if (container.length > 0) {
		container.empty();
		$('<link>', {
			rel: 'stylesheet',
			type: 'text/css',
			href: 'livenow.css'
		}).appendTo('head');
		
		status = $('<p/>').hide().appendTo(container);
		table = $('<table/>').hide().appendTo(container);
		
		done = 0;
		active = 0;
		updateStatus();
		for (var i = 0; i < livenow_games.length; i++) {
			processGame(livenow_games[i]);
		}
	}
});