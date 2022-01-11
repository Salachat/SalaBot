# SalaBot

yes.

## Running the bot without docker
1. Install latest [Node.JS](https://nodejs.org/en/download/) and [Yarn](https://classic.yarnpkg.com/en/docs/install) if you haven't installed them already
1. Clone the repo `git clone https://github.com/salachat/salabot.git` and install the bot's dependencies `yarn`
1. Create an application at [Discord Developer Portal](https://discord.com/developers/applications)
1. Create a bot for the application
1. Copy the bot's token and enable all intents (You know, because it's a private bot.)
1. Copy the `src/config.example.js` to `src/config.js`
1. Edit the config for your needs
1. Start the bot `yarn start`

## Running the bot with docker
This shall be done in future (Figure it out by yourself for now.)

## Code from other projects

- [ChickenBot](https://github.com/Chicken/ChickenBot) licensed under [MIT](https://github.com/Chicken/ChickenBot/blob/master/LICENSE) by [Chicken](https://github.com/Chicken)
  - `formatDuration` function in `src/util.js`
  - `paginatedEmbed` function in `src/util.js`
  - `stats` command `src/commands/System/stats.js`
  - `server` command `src/commands/Misc/server.js`
