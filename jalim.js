const Botkit = require('botkit');
const luis = require('./luismiddleware');
const { getHealthCheckStatus } = require('./Services/HealthCheckReader');
const { getLogByQuery } = require('./Services/LogReader')

require('dotenv').load();

if (!process.env.SLACK_BOT_TOKEN) {
    console.log('Error: Specify SLACK_BOT_TOKEN in environment');
    process.exit(1);
}

if (!process.env.LUIS_MODEL_URL) {
    console.log('Error: Specify Luis service uri');
    process.exit(1);
}

const luisOptions = {
    serviceUri: process.env.LUIS_MODEL_URL,
    minThreshold: 0.4
};

const controller = Botkit.slackbot({
    debug: false
});

controller.spawn({
    token: process.env.SLACK_BOT_TOKEN
}).startRTM(function (err) {
    if (err) {
        console.log(err);
        throw new Error(err);
    }
});

controller.middleware.receive.use(luis.middleware.receive(luisOptions));

controller.hears(['applicationshealth'], ['direct_message', 'direct_mention', 'mention'], luis.middleware.hereIntent, (bot, message) => {
    bot.reply(message, 'Hmmmm, pera ae!')

    getHealthCheckStatus().then((result) => {
        
        if (result.some(x => x.result.IsHealthy === false))
            bot.reply(message, `Alguma(s) aplicacoes responderam que nao estao de boa: \`\`\` ${JSON.stringify(result)} \`\`\``);
        else
            bot.reply(message, `Todas as aplicacoes estao de boa: \`\`\` ${JSON.stringify(result)} \`\`\``);

    }).catch((err) => {
        bot.reply(message, `Ixi, nao consegui chamar o HealthCheck da SplitAPI: ${err.toString()}`);
    })
});

controller.hears(['logquery'], ['direct_message', 'direct_mention', 'mention'], luis.middleware.hereIntent, (bot, message) => {
    const entity = message.entities.find(x => x.type === 'SQL_QUERY')
    const sqlQuery = message.text.substring(entity.startIndex, entity.endIndex + 1)

    if (sqlQuery.toLowerCase().includes('where') == false)
        bot.reply(message, 'Coloca um WHERE nessa query ai tiu')
    else {
        bot.reply(message, 'Marca ae que vou rodar isso no log')
        getLogByQuery(sqlQuery).then((result) => {
            bot.reply(message, `\`\`\` ${JSON.stringify(result)} \`\`\``)
        }).catch((err) => {
            console.log(err);
            bot.reply(message, `Nao consegui consultar, seguem os detalhes do erro: ${JSON.stringify(err)}`)
        })
    }
});

controller.hears(['greeting'], ['direct_message', 'direct_mention', 'mention'], luis.middleware.hereIntent, (bot, message) => {
    bot.reply(message, "Fala aee, to acordado!");
});

controller.hears('.*', ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
    bot.reply(message, "Malz man, não entendi :(");
});