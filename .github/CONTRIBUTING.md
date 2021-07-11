# Contributing

## Suggestions & Issues

To suggest features for the bot use the Github issue tracker.

If you believe to have found a bug in the code and think it's harmless, report it through the Github issue tracker.   
If you think that this bug might be harmful or exploitable, report it privately by contacting one of the organisation admins.

## Pull requests

Contributors are welcome. Feel free to fork and submit a pull request for review.

1. Fork & clone
1. Create a new branch
1. Code away
1. Test your changes
1. Commit & push
1. Submit the pull request
1. Act according to reviews

## Guidelines

To make sure that your pull request gets accepted you need to follow some guidelines.  
This is not everything but a list of basic things. Think before you do.  

* Modularity is great
* No inappropriate stuff
* Follow "best practices" for javascript
* Make sure that the feature is usable by everyone
* Write the code so that it can be understood and modified in the future

## Running the bot

Running the bot shouldn't be hard for an experienced user but might give a headache for a first timer.

1. Install [Node.JS](https://nodejs.org/en/download/) and [Yarn](https://classic.yarnpkg.com/en/docs/install) if don't have them already
1. Create an application at [Discord Developer Portal](https://discord.com/developers/applications)
1. Create a bot for the application
1. Copy the bot's token and enable all intents (Too lazy to worry about problems with intents)
1. Copy `.env.example` to `.env`
1. Fill in the necessary fields
1. Copy the `src/config.example.js` to `src/config.js`
1. Edit the config to your needs
1. Install dependencies with `yarn`
1. Run with `yarn start`
