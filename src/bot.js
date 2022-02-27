const { REST } = require("@discordjs/rest");
const { env } = require("./config.js");
const { Routes } = require("discord-api-types/v9");
const { Client, Intents } = require("discord.js");
const { databaseManager } = require("./database/databaseManager");
const Utils = require("./utils.js");

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
    ],
});

const normalized_path = require("path").join(__dirname, "commands");

let commands = [];
let command_handlers = { APPLICATION_COMMAND: {}, MESSAGE_COMPONENT: {} };

//reads and imports files from ./commands directory
require("fs")
    .readdirSync(normalized_path)
    .forEach((file) => {
        commands.push(require("./commands/" + file));
    });

//maps imported commands to command_handlers so they are grouped by type
//this allows to make only one client.on listener for all commands
commands.map((data) => {
    data.handlers.map((handle) => {
        command_handlers[handle.type][data.commandName] = handle.func;
    });
});

// TODO: Refactor this
// const commands = [
//   require("./commands/addgroup.js"),
//   require("./commands/setup.js"),
//   require("./commands/reset.js"),
//   require("./commands/addteacher.js"),
//   require("./commands/addstudents.js"),
//   require("./commands/removegroup.js"),
//   require("./commands/removestudents.js"),
//   require("./commands/removeteacher.js"),
//   require("./commands/poll.js"),
//   require("./commands/tasktracker.js"),
// ];

// TODO: Move every command file from format: register => { client.on('interaction' ) }
// to client.on('interaction', () => register() )
// (safer for memory)
// client.setMaxListeners(30);

// register comamnds handlers

// commands.map((cmd) => {
//   cmd.registerHandler(client);
// });

// console.log(command_handlers);
client.on("ready", () => {
    Utils.logDebug(`Logged in as ${client.user.tag}!`);
});

client.on("rateLimit", (info) => {
    Utils.logDebug("rate limit: \n" + JSON.stringify(info));
});

client.on("guildMemberAdd", async (member) => {
    Utils.logDebug("New user joined");
    if (await databaseManager.isGuildSettedUp(member.guild.id)) {
        Utils.logDebug("Asigning Guest role");
        await member.guild.roles.fetch().then((roles) => {
            roles.map((role) => {
                if (role.name === "Gosc") member.roles.add(role);
            });
        });
    }
});

client.on("interactionCreate", async (interaction) => {
    const type = interaction.type;
    const commandName =
        interaction.commandName ?? interaction.message.interaction.commandName;

    if (!command_handlers.hasOwnProperty(type)) return;
    if (!command_handlers[type].hasOwnProperty(commandName)) return;

    Utils.logDebug(command_handlers[type][commandName]);
    command_handlers[type][commandName](interaction);
});
// perform asynchronous queue loop
// created specifically to be able to handle
// big bulk updates without constantly getting timed out

// singular operations have priority over bulk updates

// const queue = require('./queue.js');
// const actionQueue = new queue.ActionQueue();
// setInterval( () => {
//     while ( !actionQueue.empty() ) {
//         sleep( actionQueue.getTimeout()+1 ).then( () => {
//             console.log( `${actionQueue.size()} in queue... ` )
//             actionQueue.setTimeout(0)
//             actionQueue.performNextAction()
//         });
//     }
// }, 0)

// Not Yet Implemented, does not seem to work. Should look into this in the future

client.login(env.BOT_TOKEN);

const parsed_slash_commands = [...commands.map((e) => e.command.toJSON())];

(async (client) => {
    const rest = new REST({ version: "9" }).setToken(env.BOT_TOKEN);
    try {
        Utils.logDebug("Started refreshing application (/) commands.");
        // Utils.logDebug(parsed_body)
        if (process.argv.includes("production-mode")) {
            Utils.logDebug("Running in PRODUCTION mode");
            await rest.put(Routes.applicationCommands(env.APP_ID), {
                body: parsed_slash_commands,
            });
        } else {
            Utils.logDebug("Running in DEVELOPER mode");
            await rest.put(
                Routes.applicationGuildCommands(env.APP_ID, env.DEV_SERVER_ID),
                { body: parsed_slash_commands }
            );
        }

        Utils.logDebug("Successfully reloaded application (/) commands.");
    } catch (error) {
        Utils.logDebug(error);
    }
})(client);
