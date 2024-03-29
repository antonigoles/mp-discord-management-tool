const { SlashCommandBuilder } = require('@discordjs/builders');
const { databaseManager } = require("../database/databaseManager.js")

const COMMAND_NAME  =   "setup";
const DESCRIPTION   =   "Basic setup";

const registerHandler = async (client) => {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;
        if ( interaction.commandName === COMMAND_NAME ) {
            // command stuff
            if ( !(await interaction.member.permissions.has("ADMINISTRATOR", true))) {
                interaction.reply({content: "Nie masz permisji"})
                return;
            }
            if ( await databaseManager.isGuildSettedUp( interaction.guild.id ) ) {
                interaction.reply({content: `😣 Serwer jest już skonfigurowany`});
                return;
            }
            await databaseManager.setGuildSetupStatus( interaction.guild.id, true )


            interaction.guild.roles.create({
                name: `Admin`,
                color: 'RED',
                permissions: "ADMINISTRATOR",
                hoist: true,
            })

            interaction.guild.roles.create({
                name: `Nauczyciel`,
                color: 'YELLOW',
                permissions: "MODERATE_MEMBERS",
                hoist: true,
            })

            interaction.guild.roles.create({
                name: `Uczen`,
                color: 'BLUE',
                hoist: true,
            })

            interaction.guild.roles.create({
                name: `Gosc`,
                color: 'WHITE',
                hoist: true,
            }).then( guestRank => {
                interaction.guild.members.fetch().then( members => {
                    members.map( member => {
                        member.roles.add( guestRank )
                    })
                })
            })

            

            interaction.reply({content: `👉 Dodano rangi: ${ "`Admin, Nauczyciel, Uczen, Gosc`" }`});
        }
    });
}


exports.command = new SlashCommandBuilder()
                    .setName(COMMAND_NAME)
                    .setDescription(DESCRIPTION)

exports.registerHandler = registerHandler