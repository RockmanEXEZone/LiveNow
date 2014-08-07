Live Now
========

Live Now is a web application written in jQuery that queries the Twitch.tv API and displays all live streams of Mega Man Battle Network or Mega Man Star Force games. All Twitch API requests are made from the user's browser, which also prevents abuse.

Live demo
---------
A live demo of the application can be found at http://www.therockmanexezone.com/livenow/.

Usage
-----
To embed Live Now on a web page, copy *livenow.js*, *livenow.css* and the *logo* directory to your web server. Make sure jQuery is included in the web page you want to embed Live Now on. Declare a *livenow_games* variable in a script tag, containing the Twitch IDs and Twitch names of the games that you want to query. To load specific from Hitbox as well, supply the Hitbox game IDs; otherwise, leave it out or set it to 0. You can also supply an URL to the game's boxart; if none is specified, game artwork will be loaded from Twitch.

Then embed the JavaScript file and container, optionally specifying the width, as shown in the example below:
```
<script type="text/javascript">
    var livenow_games = [
        { id:   7542, hitbox:  7705, name: 'Mega Man Battle Network',
            boxart: 'box/bn1.png' },
        { id:  24465, hitbox: 21710, name: 'Rockman EXE Operate Shooting Star',
            boxart: 'box/exeoss.png' },
        { id:   4682, hitbox:  5312, name: 'Mega Man Battle Network 2',
            boxart: 'box/bn2.png' },
        { id:  12105, hitbox: 11480, name: 'Mega Man Battle Network 3',
            boxart: 'box/bn3.png' },
        { id:   3108, hitbox:  4021, name: 'Mega Man Battle Network 4',
            boxart: 'box/bn4.png' },
        { id:  10763, hitbox: 10393, name: 'Rockman EXE 4.5 Real Operation',
            boxart: 'box/exe45.png' },
        { id:  11522, hitbox: 10999, name: 'Mega Man Battle Network 5',
            boxart: 'box/bn5.png' },
        { id:   9009, hitbox:  8916, name: 'Mega Man Battle Network 5: Double Team DS',
            boxart: 'box/bn5ds.png' },
        { id:   7325, hitbox:  7535, name: 'Mega Man Battle Network 6',
            boxart: 'box/bn6.png' },
        { id:  17587, hitbox: 15975, name: 'Mega Man Battle Chip Challenge',
            boxart: 'box/bcc.png' },
        { id:   5831, hitbox:     0, name: 'Mega Man Network Transmission',
            boxart: 'box/nt.png' },
        { id:  22528, hitbox:     0, name: 'Rockman EXE WS',
            boxart: 'box/exews.png' },
        { id:   1350, hitbox:  2567, name: 'Mega Man Star Force',
            boxart: 'box/sf1.png' },
        { id:  18770, hitbox: 16953, name: 'Mega Man Star Force 2',
            boxart: 'box/sf2.png' },
        { id:  19495, hitbox: 17652, name: 'Mega Man Star Force 3',
            boxart: 'box/sf3.png' },
        { id: 416185, hitbox:     0, name: 'Mega Man Battle Network Chrono X',
            boxart: 'box/bncx.png' }
];
</script>
<script type="text/javascript" src="livenow.js"></script>
<div id="livenow-container" style="width: 1200px"></div>
```

Notes
-----
* Live Now was written for jQuery v1.11.1, but it will probably work in other versions as well.
* Responses from the Twitch API are encoded in UTF-8. If the application is embedded in a page stored in a different encoding, channel names and descriptions may not display properly.
* The example above uses the Twitch IDs for the games, however any sort of unique identifier will work.

Credits
=======
**Live Now (c) 2014**
* Prof. 9

Mega Man, Mega Man Battle Network and Mega Man Star Force are (c) Capcom 1987 - 2014

License
=======
This project is licensed under the terms of the MIT license. See *license.txt* for more information.