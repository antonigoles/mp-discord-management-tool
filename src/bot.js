const { REST } = require('@discordjs/rest');
const { env } = require("./config.js")
const { Routes } = require('discord-api-types/v9');
const Utils = require('./utils.js')
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });

// Register event listeners

const eventListeners = [
    require("./eventListeners/guildMemberAdd.js"),
];

eventListeners.forEach(e => e.listen(client));

// register comamnds handlers

// TODO: Refactor this

// TODO: Move every command file from format: register => { client.on('interaction' ) }
// to client.on('interaction', () => register() )
// (safer for memory)
client.setMaxListeners(30)

const commands = [ 
    require("./commands/addgroup.js"),
    require("./commands/setup.js"),
    require("./commands/reset.js"),
    require("./commands/addteacher.js"),
    require("./commands/addstudents.js"),
    require("./commands/removegroup.js"),
    require("./commands/removestudents.js"),
    require("./commands/removeteacher.js"),
    require("./commands/poll.js"),
    require("./commands/tasktracker.js"),
    require("./commands/grouprename.js"),
    require("./commands/removekickedmembers.js"),
    require("./commands/addchannel.js"),
];

commands.forEach(cmd=>cmd.registerHandler(client))

client.on('ready', () => {
    Utils.logDebug(`Logged in as ${client.user.tag}!`);
});

client.on('rateLimit', (info) => {
    Utils.logDebug("rate limit: \n" + JSON.stringify(info))
})

client.login(env.BOT_TOKEN);


(async (client) => {
    const rest = new REST({ version: '9' }).setToken(env.BOT_TOKEN);
    try {
        Utils.logDebug('Started refreshing application (/) commands.');
        let parsed_body = [...commands.map( e => e.command.toJSON() )]
        // Utils.logDebug(parsed_body)
        if ( process.argv.includes("production-mode") ) {
            Utils.logDebug( "Running in PRODUCTION mode")
            await rest.put(
                Routes.applicationCommands(env.APP_ID),
                { body: parsed_body },
            );
        } else {
            Utils.logDebug("Running in DEVELOPER mode")
            await rest.put(
                Routes.applicationGuildCommands(env.APP_ID, env.DEV_SERVER_ID ),
                { body: parsed_body },
            );
            Utils.logDebug( env )
        }

        Utils.logDebug('Successfully reloaded application (/) commands.');
    } catch (error) {
        Utils.logDebug(error);
    }
})(client);

