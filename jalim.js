const Botkit = require('botkit');
const luis = require('./luismiddleware');
const request = require('request-promise');
require('dotenv').load();

if (!process.env.SLACK_BOT_TOKEN) {
    console.log('Error: Specify SLACK_BOT_TOKEN in environment');
    process.exit(1);
}

if (!process.env.LUIS_MODEL_URL) {
    console.log('Error: Specify Luis service uri');
    process.exit(1);
}

const luisOptions = { serviceUri: process.env.LUIS_MODEL_URL };

const controller = Botkit.slackbot({
    debug: false
});

controller.spawn({
    token: process.env.SLACK_BOT_TOKEN
}).startRTM(function (err) {
    if (err)
        throw new Error(err);
});

controller.middleware.receive.use(luis.middleware.receive(luisOptions));

controller.hears(['applicationshealth'], ['direct_message', 'direct_mention', 'mention'], luis.middleware.hereIntent, (bot, message) => {
    bot.reply(message, 'Hmmm, pera ae!')

    request({ uri: 'https://split.braspag.com.br/api/healthcheck', json: true }).then((result) => {
        bot.reply(message, `Olha o resultado da Split API: ${JSON.stringify(result)}`);
    }).catch((err) => {
        bot.reply(message, `Ixi, nao consegui chamar o HealthCheck da SplitAPI: ${err.toString()}`);
    });
});

controller.hears('.*', ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
    bot.reply(message, "Malz man, não entendi :(");
});