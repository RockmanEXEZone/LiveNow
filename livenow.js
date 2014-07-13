$(function() {
	function addCommas(number) {
		return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	
	function processGame(game) {
		var header = $('<tr/>', {
			id: 'livenow-game-' + game.id,
		}).hide().append($('<th/>', {
			colspan: 5
		}).html(game.name)).appendTo(table);
		
		jQuery.getJSON('https://api.twitch.tv/kraken/streams?callback=?', {
			game: game.name 
		}, function(data) {
			$('<th/>', {
				rowspan: data.streams.length + 1
			}).append($('<img/>', {
				src: 'https://static-cdn.jtvnw.net/ttv-boxart/' + encodeURI(game.name) + '-52x72.jpg',
				width: 52,
				height: 72
			})).prependTo(header);
			
			if (data.streams.length > 0) {
				data.streams.sort(function(a, b) { return a.viewers - b.viewers; });
				header.show();
				for (var i = 0; i < data.streams.length; i++) {
					var stream = data.streams[i];
					var a = $('<a/>', {
						href: stream.channel.url
					});
					$('<tr/>').append(
						$('<td/>').append(
							a.clone().append(
								$('<img/>', {
									src: stream.channel.logo || 'http://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_50x50.png',
									width: 50,
									height: 50
								})
							)
						),
						$('<td/>').append(
							a.clone().append(
								$('<strong/>').html(stream.channel.display_name)
							)
						),
						$('<td/>').append(
							a.clone().append(
								$('<img/>', {
									src: stream.preview.small,
									width: 80,
									height: 50
								})
							)
						),
						$('<td/>').css('width', '100%').html(stream.channel.status),
						$('<td/>').append(
							$('<div/>').html(addCommas(stream.viewers)),
							'viewers'
						)
					).insertAfter(header);
				}
				active++;
			}
		}).fail(function() {
			header.prepend(
				$('<th/>', {
					rowspan: 2
				})
			).show().after(
				$('<tr>').append(
					$('<td/>', {
						colspan: 5
					}).html('Error fetching data!')
				)
			);
			active++;
		}).always(function() {
			done++;
			updateStatus();
		});
	}

	function updateStatus() {
		if (done == livenow_games.length) {
			if (active > 0) {
				status.hide().empty();
			} else {
				status.html('No one is streaming right now.').show();
			}
			table.show();
		} else {
			status.html('Loading games... (' + Math.round((done * 100) / livenow_games.length) + '%)').show();
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
		
		status = $('<div/>').hide().appendTo(container);
		table = $('<table/>').hide().appendTo(container);
		
		done = 0;
		active = 0;
		updateStatus();
		for (var i = 0; i < livenow_games.length; i++) {
			processGame(livenow_games[i]);
		}
	}
});