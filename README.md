node-Daemon
===========

node-Daemon watches your scripts and when you save changes Daemon restarts running script. Here's example:

    $ node d.js
    Usage: node d.js server.js [params]
    $ node d.js server.js
    Daemon started.
    Press [enter] anytime to restart script.
    Press Ctrl+C to exit Daemon.
    8 May 13:07:25 - Server listening on port 6669

Now modify and save server.js or any of the require()d files. Daemon reacts instantly:

    Restarting script.
    8 May 13:12:25 - Server listening on port 6669
    
How it Works/Limitations
------------------------

Daemon recursively parses all require()d scripts and adds them to watch list.

It is currently unable to watch dynamically loaded dependencies:

    var dep = './csv';
    require(dep);
   
In the above case, changes occuring on *csv.js* will not cause your script to restart.
