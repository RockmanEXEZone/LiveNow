Live Now
========
Live Now is a web application written in jQuery that queries the Twitch, Hitbox and Gaming Live APIs and displays all live streams of Mega Man Battle Network or Mega Man Star Force games. All API requests are made from the user's browser, which also prevents abuse.

Live demo
---------
A live demo of the application can be found at http://www.therockmanexezone.com/livenow/.

Usage
-----
To embed Live Now on a web page:

1. Copy **livenow.js**, **livenow.css** and the **img** directory to your web server.
2. Make sure **jQuery** is included in the web page you want to embed Live Now on.
3. Include **livenow.js** on the page, preferably in the **&lt;head&gt;** tag; make sure it comes after jQuery!
4. Put a **&lt;div&gt;** with ID **livenow-container** on the page where you want Live Now to load.
5. After the page has finished loading, use **LiveNow.initGames()** to set the names for the games you want to show. You can optionally also supply URLs for their boxarts.
6. Call **LiveNow.initQueue()** for every streaming service (Twitch, Hitbox, etc.) you want to load from.

**LiveNow.initGames()** takes one parameter: an array of objects, where every object contains a **name** property containing your preferred name for the game, and an optional **boxart** property containing the URL for that game's boxart. If no boxart is specified, it is loaded from Twitch.

**LiveNow.initQueue()** takes one parameter, which is an object. The first is the platform, which must be either "**Twitch**", "**Hitbox**" or "**GamingLive**". The second is an array of game objects, where every object contains a **id** property which is the index of said game in the **LiveNow.initGames()** call parameter, and an optional **key** property which contains the identifier for that game in the platform's API; if none is specified, the game's title from the **LiveNow.initGames()** call is used as its identifier. If a game has multiple API identifiers, then supply a game object for each with the same **id**, but different **key**.

Tinycon support
---------------
Live Now also has optional support for Tinycon (https://github.com/tommoor/tinycon). If Tinycon is loaded on the page, the current number of live streams will be displayed in the page's favicon.

Example
-------
```
<div id="livenow-container"></div>
<script type="text/javascript">
	$(function() {
		// Initialize games.
		LiveNow.initGames([
			{ name: "Mega Man Battle Network", boxart: 'box/bn1.png' },
			{ name: "Rockman EXE Operate Shooting Star", boxart: 'box/exeoss.png' },
			{ name: "Mega Man Battle Network 2", boxart: 'box/bn2.png' },
			{ name: "Mega Man Battle Network 3", boxart: 'box/bn3.png' },
			{ name: "Mega Man Battle Network 4", boxart: 'box/bn4.png' },
			{ name: "Rockman EXE 4.5 Real Operation", boxart: 'box/exe45.png' },
			{ name: "Mega Man Battle Network 5", boxart: 'box/bn5.png' },
			{ name: "Mega Man Battle Network 5: Double Team DS", boxart: 'box/bn5ds.png' },
			{ name: "Mega Man Battle Network 6", boxart: 'box/bn6.png' },
			{ name: "Mega Man Battle Chip Challenge", boxart: 'box/bcc.png' },
			{ name: "Mega Man Network Transmission", boxart: 'box/nt.png' },
			{ name: "Rockman EXE WS", boxart: 'box/exews.png' },
			{ name: "Mega Man Star Force", boxart: 'box/sf1.png' },
			{ name: "Mega Man Star Force 2", boxart: 'box/sf2.png' },
			{ name: "Mega Man Star Force 3", boxart: 'box/sf3.png' },
			{ name: "Mega Man Battle Network Chrono X", boxart: 'box/bncx.png' }
		]);

		// Initialize Twitch queue.
		LiveNow.initQueue("Twitch", [
			{ id: 0 },
			{ id: 1 },
			{ id: 2 },
			{ id: 3 },
			{ id: 4 },
			{ id: 5 },
			{ id: 6 },
			{ id: 7 },
			{ id: 8 },
			{ id: 9 },
			{ id: 10 },
			{ id: 11 },
			{ id: 12 },
			{ id: 13 },
			{ id: 14 },
			{ id: 15 }
		]);
        
		// Initialize Hitbox queue.
		LiveNow.initQueue("Hitbox", [
			{ id: 0, key: 7705 },
			{ id: 1, key: 21710 },
			{ id: 2, key: 5312 },
			{ id: 3, key: 11480 },
			{ id: 4, key: 4021 },
			{ id: 5, key: 10393 },
			{ id: 6, key: 10999 },
			{ id: 7, key: 8916 },
			{ id: 8, key: 7535 },
			{ id: 9, key: 15975 },
			{ id: 12, key: 2567 },
			{ id: 13, key: 16953 },
			{ id: 14, key: 17652 }
		]);

		// Initialize Gaming Live queue.
		LiveNow.initQueue("GamingLive", [
			{ id: 0, key: "battle-network-rockman-exe" },
			{ id: 3, key: "mega-man-battle-network-3" },
			{ id: 4, key: "mega-man-battle-network-4-blue-moon" },
			{ id: 6, key: "mega-man-battle-network-5-team-protoman" },
			{ id: 6, key: "mega-man-battle-network-5-team-colonel" },
			{ id: 7, key: "mega-man-battle-network-5-double-team" },
			{ id: 9, key: "mega-man-battle-chip-challenge" },
			{ id: 10, key: "mega-man-network-transmission" },
			{ id: 12, key: "mega-man-star-force" },
			{ id: 12, key: "megaman-star-force-dragon" },
			{ id: 13, key: "mega-man-star-force-2" },
			{ id: 14, key: "mega-man-star-force-3" }
		]);
	});
</script>
```

Notes
-----
* Live Now was written for jQuery v1.11.1, but it will probably work in other versions as well.
* Responses from various APIs are encoded in UTF-8. If Live Now is embedded in a page stored in a different encoding, channel names and descriptions may not display properly.

Credits
=======
**Live Now © 2014 - 2015 Prof. 9**

Mega Man, Mega Man Battle Network and Mega Man Star Force are © Capcom 1987-2015.

All rights belong to their respective owners.

License
=======
This project is licensed under the terms of the MIT license. See **LICENSE.txt** for more information.