Live Now
========

Live Now is a web application written in jQuery that queries the Twitch.tv API and displays all live streams of Mega Man Battle Network or Mega Man Star Force games. All Twitch API requests are made from the user's browser, which also prevents abuse.

Live demo
---------
A live demo of the application can be found at http://www.therockmanexezone.com/livenow/.

Usage
-----
To embed Live Now on a web page, first make sure jQuery is loaded. Declare a *livenow_games* variable in a script tag, containing the Twitch IDs and names of the games that you want to query.

Then embed the JavaScript file and container, optionally specifying the width, as shown in the example below:
```
<script type="text/javascript">
    var livenow_games = [
        { id:   7542, name: 'Mega Man Battle Network' },
        { id:  24465, name: 'Rockman EXE Operate Shooting Star' },
        { id:   4682, name: 'Mega Man Battle Network 2' },
        { id:  12105, name: 'Mega Man Battle Network 3' },
        { id:   3108, name: 'Mega Man Battle Network 4' },
        { id:  10763, name: 'Rockman EXE 4.5 Real Operation' },
        { id:  11522, name: 'Mega Man Battle Network 5' },
        { id:   9009, name: 'Mega Man Battle Network 5: Double Team DS' },
        { id:   7325, name: 'Mega Man Battle Network 6' },
        { id:  17587, name: 'Mega Man Battle Chip Challenge' },
        { id:   5831, name: 'Mega Man Network Transmission' },
        { id:  22528, name: 'Rockman EXE WS' },
        { id:   1350, name: 'Mega Man Star Force' },
        { id:  18770, name: 'Mega Man Star Force 2' },
        { id:  19495, name: 'Mega Man Star Force 3' },
        { id: 416185, name: 'Mega Man Battle Network Chrono X' },
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