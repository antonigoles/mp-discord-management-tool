const { REST } = require('@discordjs/rest');
const { env } = require("./config.js")
const { Routes, Utils } = require('discord-api-types/v9');
const { sleep } = require('./utils.js')
const { Client, Intents } = require('discord.js');
const { databaseManager } = require("./database/databaseManager");
const client = new Client({ intents: [Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });



const commands = [ 
    require("./commands/addgroup.js"),
    require("./commands/setup.js"),
    require("./commands/reset.js"),
    require("./commands/addteacher.js"),
    require("./commands/addstudents.js"),
    require("./commands/removegroup.js"),
    require("./commands/removestudents.js"),
    require("./commands/removeteacher.js"),
];

// register comamnds handlers

commands.map( (cmd) => {
    cmd.registerHandler(client)
})


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('rateLimit', (info) => {
    console.log("rate limit: \n" + JSON.stringify(info))
    actionQueue.setTimeout(info.timeout)
})

client.on("guildMemberAdd", async (member) => {
    console.log("New user joined")
    if ( await databaseManager.isGuildSettedUp( member.guild.id ) ) {
        console.log("Asigning Guest role")
        await member.guild.roles.fetch().then( roles => {
            roles.map( role => {
                if ( role.name === "Gosc" ) member.roles.add(role);
            })
        })
    }
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


(async (client) => {
    const rest = new REST({ version: '9' }).setToken(env.BOT_TOKEN);
    try {
        console.log('Started refreshing application (/) commands.');
        console.log()
        let parsed_body = [...commands.map( e => e.command.toJSON() )]
        console.log(parsed_body)
        if ( process.argv.includes("production-mode") ) {
            console.log("Running in PRODUCTION mode")
            await rest.put(
                Routes.applicationCommands(env.APP_ID),
                { body: parsed_body },
            );
        } else {
            console.log("Running in DEVELOPER mode")
            await rest.put(
                Routes.applicationGuildCommands(env.APP_ID, env.DEV_SERVER_ID ),
                { body: parsed_body },
            );
        }

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})(client);
