# nhl-scorebug

A [scorebug](https://en.wikipedia.org/wiki/Score_bug) for NHL games (goals + shots), intended for display on a dedicated ~4", 800x480px screen. This project also includes some typings for the [NHL Stats API](https://gitlab.com/dword4/nhlapi/-/blob/master/stats-api.md).

## Manifesto & Features

Largely, this project exists because some networks feel it's unnecessary to provide shots in their scorebug, but I like looking at them. That is the crux, but some other fun addendums include:

- Portable & pretty live data intended for viewing at a distance (e.g. at some kind of hockey party where you don't want to show all the games but you do want to show the scores?)
- Nifty web interface to select games (designed for touchscreens)
- Companion page for mobile phones to select a game from your sofa

## Screenshots

I do not provide a public instance of this project (you should [self-host](#self-hosting) if you wish to use it), so here are some screenshots.

![Index](https://github.com/shayypy/puck-buddy/assets/43248357/5dcc6288-66c2-4104-ad72-f75b98d84725)

"SET UP" is a button that leads to the linking page for mobile/controller devices.

![Game page](https://github.com/shayypy/puck-buddy/assets/43248357/e2eacdce-dbd5-4677-9696-323024b18fe7)

The above shows game ID `2022020001`. In the event that both teams' scores are the same (during a game), neither box is highlighted.

![Mobile view](https://github.com/shayypy/puck-buddy/assets/43248357/06c25990-f379-4a4a-981b-02bf76bbe378)

The newer Safari design (with the address bar at the bottom) obscures the "Linked to [...]" bar, but the app still works fine without it. Pictured is Firefox on iOS 15. "TV" is the `DEVICE_NAME` of my scorebug device.

## Self-hosting

This section will not be too in-depth but it should be sufficient especially if you have done something like this before. If you're having trouble, feel free to [reach out to me](https://shay.cat) (click the "holler" button).

1. Install [Node.js](https://nodejs.org/en/) & [Redis](https://redis.io/docs/getting-started/installation/)

   - Go ahead and start your Redis server if necessary so you don't forget (see above link).

2. Install [Yarn](https://yarnpkg.com/getting-started/install)

   - NPM should be fine, but I use Yarn.

3. Clone this repository into a directory on your machine (`git clone https://github.com/shayypy/nhl-scorebug` - this will clone into a new folder named `nhl-scorebug`)
4. CD into the folder you created. Run `yarn` to install dependences (or `npm i`)
5. Create a new file named `.env`. Fill it with the following keys (separated by line breaks):

   - `REDIS_URI=redis://...` - URI to your Redis server (like `redis://user:password@host:port/dbnum`)
   - (optional) `COOKIE_SECRET=anything` - a secret to [sign the link cookie](https://remix.run/docs/en/v1/utils/cookies#signing-cookies)
   - (optional) `DEVICE_NAME=anything` - the name that clients will see when they link to your scorebug

6. Start the server (`yarn start` or `npm run start` - this will build and start the server and put its address in the terminal)
7. Open the latter address (the non-`localhost` one) on your "host" machine. This is the machine that will be displaying the scores.

   - Users (you and your friends) are now able to visit the URL shown by your scorebug (if they are on the same network) in order to link their phones and control the scorebug remotely.

8. Profit

## Contributing

This project ideally does not need much maintenance outside of style updates and bug fixes. You can only fit so much information on a 4" screen while sitting across the room from it. Nevertheless, if you feel this project can be improved, feel free to create a [pull request](https://github.com/shayypy/nhl-scorebug/pulls).

## See Also

If you like watching hockey, check out [Jerso](https://jerso.fun)!
