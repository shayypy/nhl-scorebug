# nhl-scorebug

A [scorebug](https://en.wikipedia.org/wiki/Score_bug) for NHL games (goals + shots), intended for display on a dedicated ~4", 800x480px screen. This project also includes some typings for the [NHL Stats API](https://gitlab.com/dword4/nhlapi/-/blob/master/stats-api.md).

## Manifesto & Features

Largely, this project exists because some networks feel it's unnecessary to provide shots in their scorebug, but I like looking at them. That is the crux, but some other fun addendums include:

- Portable & pretty live data intended for viewing at a distance (e.g. at some kind of hockey party where you don't want to show all the games but you do want to show the scores?)
- Nifty web interface to select games (designed for touchscreens)
<!--
  - Companion page for mobile phones to select a game from your sofa (currently unrestricted)
-->

## Screenshots

I do not provide a public host for this project (you should self-host if you wish to use it), so here are some screenshots.

![Index](https://cdn.discordapp.com/attachments/663900311886364673/1050918926915215421/Screenshot_2022-12-09_at_18-32-57_NHL_Scorebug.png)

Note that 192.168.1.8 is the IP of my computer on my local network. Yours may be different, and clients must be connected to the same network to access it.

![Game page](https://cdn.discordapp.com/attachments/663900311886364673/1050918927204634734/Screenshot_2022-12-09_at_18-34-30_NHL_Scorebug.png)

The above shows game ID `2022020001`. In the event that both teams' scores are the same (during a game), neither box is highlighted.

## Contributing

This project ideally does not need much maintenance outside of style updates and bug fixes. You can only fit so much information on a 4" screen while sitting across the room from it. Nevertheless, if you feel this project can be improved, feel free to create a [pull request](https://github.com/shayypy/nhl-scorebug/pulls).

## See Also

If you like watching hockey, check out [Jerso](https://jerso.fun)!
