$(function() {
	var windowTitle = document.title;
	
	var url_regex = /(?:\s|^)(?:https?:\/\/)?(([^\s#\.\/?&=%\-_'"]+\.)([^\s:#\.\/?&=%_'"]*[^\s:#\.\/\-?&=%_'"]\.)*(?!exe|batc?h?|avi|mp(3|4|e?g)|jpe?g|png|gif|bmp|tiff?|psd|cmd?|bin|du?mp)([^\d\s:#\.\/?&=%\-_'"]{2,})(:[0-9]{0,5})?(\/[^\s:#\.\/?&=%\-_'"]+)*\/?(#[^\s:#\/?&=%'"]*)?\??[^\s:\/?&=%'"]*=?([^\s:#\/?&='"]+)?(&[^\s:#\/?&=%'"]*=?[^\s:#\/?&='"]*)*\/?)/i;
	
	function addCommas(number) {
		return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	}
	
	// Stream objects are passed around in the code below. These are the properties:
	//     stream.platform = 'Twitch' or 'Hitbox'
	//     stream.name = name of the streamer
	//     stream.game = name of game
	//     stream.desc = stream status/description
	//     stream.url = url of stream
	//     stream.viewers = current amount of viewers
	//     stream.lastupdate = datetime of last update
	//     stream.decay = decay value of stream (purged if 0)
	
	var twitchClientId = '';
	
	function getApi(platform, params, onsuccess, onerror) {		
		// Set base URL and callback.
		var url;
		switch (platform) {
			case 'Twitch':
			case 'TwitchUser':
				url = 'https://api.twitch.tv/kraken/streams?client_id=' + twitchClientId + '&callback=?';
				break;
			case 'Hitbox':
				url = 'http://api.hitbox.tv/media/live/list';
				break;
		}
		
		// Make the request.
		jQuery.getJSON(url, params, function(data) {
			onsuccess(data);
		}).fail(function(jqxhr) {
			// Hitbox exception.
			if (jqxhr.status === 404 && platform === 'Hitbox' && jqxhr.responseJSON
				&& jqxhr.responseJSON.error_msg === 'no_media_found') {
				onsuccess(jqxhr.responseText);
			} else {
				onerror();
			}
		});
	}

	// The streams that are currently active.
	var currentStreams = [];
	// The games list.
	var games = [];
	// Amount of games loaded.
	var loaded = 0;
	// Total amount of games.
	var total = 0;
	// Stops GUI updates if true.
	var paused = false;
	
	function updateStreams(platform, game, streams, decay) {		
		if (typeof decay === 'undefined') decay = false;
		
		if (decay === true) {
			// Decay all current streams for current game and platform.
			for (var i = 0; i < currentStreams.length; i++) {
				// Check if stream has the same platform and game.
				if (currentStreams[i].platform == platform
						&& currentStreams[i].game == game.name) {
					if (currentStreams[i].decay-- == 0) {
						currentStreams.splice(i--, 1);
					}
				}
			}
		}
		
		// Process current active streams.
		for (var i = 0; i < streams.length; i++) {
			var stream = streams[i];
			
			// Skip invalid streams (thanks Twitch).
			if (typeof stream.url === 'undefined') {
				continue;
			}
			
			// Set default stream decay.
			stream.decay = 2;
			
			// Check if stream is currently not in active streams.
			var streamIndex = findStream(currentStreams, stream);
			if (streamIndex < 0) {
				// Add it to the active streams.
				currentStreams.push(stream);
				// Report the stream as active, unless the game has not fully loaded yet.
				var initial = game.loaded[platform] < game.keys[platform].length;
				reportStream(stream, initial);
			} else {
				// Update all the info that's not missing (thanks Twitch).
				for (var key in stream) {
					if (typeof stream[key] !== 'undefined') {
						currentStreams[streamIndex][key] = stream[key];
					}
				}
			}
		}
		
		if (decay === true) {
			//console.log(currentStreams.length + ' streams active.');
		}
		
		updateDocument();
	}
	
	function findStream(array, stream) {
		// Find the first index of the stream in the array using streamEquals().
		for (var i = 0; i < array.length; i++) {
			if (streamEquals(array[i], stream)) {
				return i;
			}
		}
		return -1;
	}

	function streamEquals(stream1, stream2) {
		return stream1.url == stream2.url;
	}
	
	function getStreams(platform, game, ondata, onend, onerror, maxtries,
        interval, page, pagesize, tries, key) {
		// Set default parameters.
		if (typeof maxtries === 'undefined') maxtries = 2;
		if (typeof page === 'undefined') page = 0;
		if (typeof interval === 'undefined') interval = 3000;
		if (typeof tries === 'undefined') tries = maxtries;
		if (typeof pagesize === 'undefined') pagesize = 25;
		if (typeof key === 'undefined') key = 0;
		
		var pars;
		switch (platform) {
			case 'Twitch':
				pars = {
					game: game.keys[platform][key],
					limit: pagesize,
					offset: page * pagesize
				};
				break;
			case 'TwitchUser':
				pars = {
					channel: game.keys[platform][key],
					limit: pagesize,
					offset: page * pagesize
				};
				break;
			case 'Hitbox':
				pars = {
					game: game.keys[platform][key],
					limit: pagesize,
					start: page * pagesize
				};
				break;
		}
		
		// Make the API request.
		getApi(platform, pars, function(data) {
			// Check Hitbox empty return value.
			if (platform === 'Hitbox' && data.error_msg === 'no_media_found') {
				onend();
				return;
			}
			
			// Pass received streams.
			var streams = [];
			switch (platform) {
				case 'Twitch':
					streams = extractTwitchStreams(data, game, true);
					break;
				case 'TwitchUser':
					streams = extractTwitchStreams(data, game, false);
					break;
				case 'Hitbox':
					streams = extractHitboxStreams(data, game);
					break;
			}
			streams = filterStreams(platform, streams, game)
			ondata(streams);
			
			// Determine whether there are more pages to get.
			page++;
			var more = false;
			switch (platform) {
				case 'Twitch':
				case 'TwitchUser':
					more = page * pagesize < data._total;
					break;
				case 'Hitbox':
					more = (data.livestream ? true : false) && data.livestream.length === pagesize;
					break;
			}
			
			if (more) {
				// Get next page, if necessary.
				getStreams(platform, game, ondata, onend, onerror,
						maxtries, interval, page, pagesize, maxtries, 0);
			} else {
				key++;
				if (key < game.keys[platform].length) {
					// Get next key, if necessary
					getStreams(platform, game, ondata, onend, onerror,
						maxtries, interval, 0, pagesize, maxtries, key);
				} else {				
					// Signify end of data.
					onend();
				}
			}
		}, function() {
			// Form error message.
			var status = 'Error returned from ' + platform + ' API: page='
					+ page + ', game.name=' + game.name + '.';
			
			if (--tries > 0) {
				// Retry, if there are tries left.
				status += ' Retrying in ' + interval + 'ms (' + tries + ' left)...';
				console.log(status);
				setTimeout(function() {
					getStreams(platform, game, ondata, onend, onerror,
							maxtries, interval, page, pagesize, tries, key);
				}, interval);
			} else {
				// Abort.
				status += ' Request aborted.';
				console.log(status);
				onerror();
			}
		});
	}
	
	function extractTwitchStreams(data, game, checkGame) {
		var results = [];
		for (var i = 0; i < data.streams.length; i++) {
			var stream = data.streams[i];
			
			if (checkGame && game.keys['Twitch'].indexOf(stream.game) === -1) {
				continue;
			}
			
			results.push({
				platform: 'Twitch',
				logo: stream.channel.logo || 'http://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_50x50.png',
				name: stream.channel.display_name,
				thumb: stream.preview.small,
				game: game.name,
				url: stream.channel.url,
				desc: stream.channel.status,
				viewers: stream.viewers,
				lastupdate: new Date().getTime()
			});
		}
		return results;
	}

	function extractHitboxStreams(data, game) {
		var results = [];
		if (data.livestream) {
			for (var i = 0; i < data.livestream.length; i++) {
				var stream = data.livestream[i];
				
				if (game.keys['Hitbox'].indexOf(stream.category_id) === -1) {
					continue;
				}
				
				results.push({
					platform: 'Hitbox',
					logo: 'http://edge.sf.hitbox.tv' + stream.channel.user_logo_small,
					name: stream.media_display_name,
					thumb: 'http://edge.sf.hitbox.tv' + stream.media_thumbnail,
					game: game.name,
					url: 'http://hitbox.tv/' + stream.media_name,
					desc: stream.media_status,
					viewers: stream.media_views,
					lastupdate: new Date().getTime()
				});
			}
		}
		return results;
	}
	
	function filterStreams(platform, streams, game) {
		var results = [];
		for (var i = 0; i < streams.length; i++) {
			var stream = streams[i];
			
			if (typeof game.filters[platform] !== 'undefined') {
				if (!game.filters[platform].test(stream.desc)) {
					continue;
				}
			}
			
			results.push(stream);
		}
		return results;
	}
	
	function updateGame(platform, game) {		
		var results = [];
		//console.log("--------------------------------");
		
		getStreams(platform, game, function(data) {
			// Got some streams; add them to the rest.
			results = results.concat(data);
		}, function() {
			// Call successful; decay inactive streams.
			updateStreams(platform, game, results, true);
			if (game.loaded[platform] < game.keys[platform].length) {
				game.loaded[platform]++;
				loaded++;
			}
		}, function() {
			// Call (partially) failed; do not decay inactive streams.
			updateStreams(platform, game, results, false);
			if (game.loaded[platform] < game.keys[platform].length) {
				game.loaded[platform]++;
				loaded++;
			}
		});
	}
	
	function reportStream(stream, initial) {
		// Modify this method to do whatever you want to do when a stream goes live.
		console.log(stream.name + " is now playing " + stream.game + "! \""
			+ stream.desc + "\" - " + stream.url);
		
		// Do not show notifications on initial load.
		if (!initial) {
			if (window.Notification && Notification.permission === 'granted') {
				var n = new Notification(stream.name + ' live on ' + stream.platform + '\n' + stream.game, {
					body: stream.desc,
					icon: stream.logo
				});
				n.onclick = function() {
					window.open(stream.url, '_blank');
					n.close();
				};
				n.onshow = function() {
					setTimeout(function() {
						n.close();
					}, 5000);
				};
			}
		}
	}
	
	function initGames(list) {
		games = [];
		for (var i = 0; i < list.length; i++) {
			var game = list[i];
			games.push({
				name: game.name,
				boxart: game.boxart,
				loaded: [],
				keys: [],
				filters: []
			});
		}
		updateDocument();
	}
	
	function initQueue(queue) {		
		var platform = queue.platform;
		
		// Init update all.
		for (var i = 0; i < queue.games.length; i++) {
			var next = queue.games[i];
			if (!(next.id in games)) {
				queue.games.splice(i--, 1);
				continue;
			}
			var game = games[next.id];
			
			if (typeof game.keys[platform] === 'undefined') {
				game.keys[platform] = [];
				game.filters[platform] = [];
				game.loaded[platform] = 0;
				total++;
			} else {
				queue.games.splice(i--, 1);
			}
			game.keys[platform].push((next.key || game.name).toString());
			game.filters[platform] = next.filter;
		}
		
		for (var i = 0; i < queue.games.length; i++) {
			updateGame(platform, games[queue.games[i].id]);
		}
		
		return setInterval(function() {
			var next = queue.games.shift();
			var game = games[next.id];
			updateGame(platform, game);
			queue.games.push(next);
		// Put the length for one cycle (in ms) here.
		}, 60000 / queue.games.length);
	}
	
	function updateDocument() {
		if (paused) {
			return;
		}
		
		var table;
		var status;
		var progress = loaded >= total ? 0 : Math.round((loaded * 100) / total);
		var container = $('#livenow-container');
		if (container.length > 0) {
			if (loaded < total) {
				status = 'Loading games... (' + progress + '%)';
				document.title = windowTitle;
			} else if (loaded >= total && loaded > 0 && currentStreams.length == 0) {
				status = 'No one is streaming right now.';
				document.title = windowTitle;
			} else if (loaded == total) {
				status = '';
				loaded++;
				document.title = '(' + currentStreams.length + ') ' + windowTitle;
			}
			
			if (currentStreams.length > 0) {
				document.title = '(' + currentStreams.length + ') ' + windowTitle;
			} else {
				document.title = windowTitle;
			}
			
			if (typeof Tinycon !== 'undefined') {
				if (currentStreams.length > 99) {
					Tinycon.setBubble(99);
				} else {
					Tinycon.setBubble(currentStreams.length);
				}
			}
			
			table = $('<table/>').hide();
			
			for (var i = 0; i < games.length; i++) {
				var game = games[i];
				var streams = currentStreams.filter(function(o) {
					return o.game === game.name;
				});
				
				if (streams.length <= 0) {
					continue;
				}
				
				streams.sort(function(a, b) {
					var r = b.viewers - a.viewers;
					if (r == 0) {
						var name1 = a.name.toLowerCase();
						var name2 = b.name.toLowerCase();
						if (name1 < name2) {
							r = -1;
						} else if (name2 > name1) {
							r = 1;
						} else {
							r = 0;
						}
					}
					return r;
				});
				
				// Add game header to table.
				$('<tr/>', {
					id: 'livenow-game-' + i
				}).append(
					$('<th/>', {
						rowspan: streams.length + 1
					}).append(
						$('<img/>', {
							src: game.boxart || 'https://static-cdn.jtvnw.net/ttv-boxart/' + encodeURI(game.name) + '-52x72.jpg',
						})
					)
				).append(
					$('<th/>', {
						colspan: 6
					}).html(game.name)
				).appendTo(table);
				
				// Append stream rows.
				for (var j = 0; j < streams.length; j++) {
					var stream = streams[j];
					var fallback = '';
					
					// Parse URLs.
					var desc = stream.desc;
					if (typeof desc === 'undefined') {
						desc = '';
					}
					desc = desc.replace(url_regex, "<a href=\"http://$1\" target=\"_blank\">$&</a>");
					
					var thumb = $('<img/>', {
						src: stream.thumb + "?" + stream.lastupdate,
						width: 80,
						height: 50
					});
					switch (stream.platform) {
						case 'Twitch':
							fallback = 'http://static-cdn.jtvnw.net/ttv-static/404_preview-80x50.jpg';
							break;
						case 'Hitbox':
							fallback = 'http://www.hitbox.tv/static/img/live/no-tn.jpg';
							break;
					}
					if (fallback) {
						thumb.error(function() {
							thumb.attr('src', fallback);
						});
						thumb.css('background', 'url(' + fallback + ')');
						thumb.css('background-size', 'cover');
						fallback = '';
					}
					
					var avatar = $('<img/>', {
						src: stream.logo,
						width: 50,
						height: 50
					});
					switch (stream.platform) {
						case 'Twitch':
							fallback = '';
							break;
						case 'Hitbox':
							fallback = '';
							break;
					}
					if (fallback) {
						avatar.error(function() {
							thumb.attr('src', fallback);
						});
						thumb.css('background', 'url(' + fallback + ')');
						thumb.css('background-size', 'cover');
						fallback = '';
					}
					
					var a = $('<a/>', {
						href: stream.url,
						target: '_blank'
					});
					$('<tr/>').append(
						// Platform cell
						$('<td/>').append(
							$('<img/>', {
								src: 'img/' + stream.platform + '.png',
								width: 50,
								height: 50
							}).css('border', 'none')
						).css('padding-right', '0'),
						// Logo cell
						$('<td/>').append(
							a.clone().append(
								avatar
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
						$('<td/>').css('width', '100%').html(desc),
						$('<td/>').append(
							$('<div/>').html(addCommas(stream.viewers)),
							'viewers'
						)
					).appendTo(table);
				}
			}
			
			container.empty();
			if (status) {
				var statusElem = $('<p/>');
				if (loaded >= total) {
					statusElem.attr('style', 'background: none !important; ');
				}
				statusElem.css({
					'overflow-x': 'visible',
					'white-space': 'nowrap',
					'padding': '2pt 5pt',
					'font-size': '80%',
					'width': progress + '%'
				})
				.html(status)
				.appendTo(container);
			}
			if (table) {
				table.show();
				table.appendTo(container);
			}
		}
	}
	
	if (typeof Tinycon !== 'undefined') {
		Tinycon.setOptions({
			width: 6,
			height: 9,
			colour: '#FFFFFF',
			background: '#22242A',
			fallback: false,
			abbreviate: true
		});
	}
	
	updateDocument();
	
	if (window.Notification && Notification.permission !== 'granted') {
		Notification.requestPermission(function(status) {
			if (Notification.permission !== status) {
				Notification.permission = status;
			}
		});
	}
	
	window.LiveNow = {
		setTwitchClientId: function(id) {
			twitchClientId = id;
		},
		initGames: function(list) {
			initGames(list);
		},
		initQueue: function(platform, queue) {
			initQueue({
				platform: platform,
				games: queue
			});
		},
		setTheme: function(cssPath) {
			var style = $('link#livenow-style');
			if (style.length == 0) {
				$('<link>', {
					id: 'livenow-style',
					rel: 'stylesheet',
					type: 'text/css',
					href: cssPath
				}).prependTo('head');
			} else {
				style.attr('href', cssPath);
			}
		},
		pauseLayout: function(value) {
			if (paused && !value) {
				paused = false;
				updateDocument();
			}
			paused = value;
		}
	}
});