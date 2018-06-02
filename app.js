const botBuilder = require('botbuilder');
const restify = require('restify');
const request = require('request-promise');
require('dotenv').load();


// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new botBuilder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new botBuilder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

server.get('/api/ping', (req, res) => res.sendRaw('pong'))

const LuisModelUrl = process.env.LUIS_MODEL_URL;

// Main dialog with LUIS
var recognizer = new botBuilder.LuisRecognizer(LuisModelUrl);

var intents = new botBuilder.IntentDialog({ recognizers: [recognizer] })

    // If User greeted the bot
    .matches('greeting', (session, args) => {
        session.send('Hi There');
    })
    .matches('ApplicationsHealth', (session, args) => {
        session.send('Vou verificar, pera ae!')

        request({ uri: 'https://split.braspag.com.br/api/healthcheck', json: true }).then((result) => {
            session.send('Olha o resultado da Split API: ', result);
        }).catch((err) => {
            session.send('Ixi, nao consegui chamar o HealthCheck da SplitAPI: ', result);
        });
    })
    .onDefault((session) => {
        session.send('Sorry, I did not understand.', session.message.text);
    });


bot.dialog('/', intents);