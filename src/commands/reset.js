const { SlashCommandBuilder } = require('@discordjs/builders');
const { ApplicationCommandManager } = require('discord.js');
const { databaseManager } = require("../database/databaseManager.js")
const { includesAny } = require("../utils.js")

const COMMAND_NAME  =   "reset";
const DESCRIPTION   =   "Resets everything";

const registerHandler = (client) => {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;
        if ( interaction.commandName === COMMAND_NAME ) {
            // command stuff
            if ( !(await interaction.member.permissions.has("ADMINISTRATOR", true))) {
                interaction.reply({content: "Nie masz permisji"})
                return
            }

            if ( !await databaseManager.isGuildSettedUp( interaction.guild.id ) ) {
                interaction.reply({content: `😣 Serwer jeszcze nie jest zsetupowany, ${ "`/setup`"} by zsetupować`});
                return;
            }

            interaction.reply({content: `❗ Resetowanie...`});
            if ( interaction.options.getSubcommand() === "full" ) {
                await databaseManager.setGuildSetupStatus( interaction.guild.id, false)
                await interaction.guild.roles.fetch()
                    .then( roles => {
                        roles.map( role => {
                            const r_name = role.name
                            if ( includesAny(r_name, ["Grupa: ","Admin","Uczen","Nauczyciel","Gosc"]) )
                                interaction.guild.roles.delete( role.id, "setup reset")
                        })
                    })
            } else {
                await interaction.guild.roles.fetch()
                    .then( roles => {
                        roles.map( role => {
                            const r_name = role.name
                            if ( includesAny(r_name, ["Grupa: ","Admin","Uczen: ","Nauczyciel: ","Gosc: "]) ) 
                                interaction.guild.roles.delete( role.id, "group reset")
                        })
                    })
            }


            databaseManager.getAllGroupsFromGuild( interaction.guild.id ).then( groups => {
                groups.map( group => {
                    group.channels.map( channelId => {
                        interaction.guild.channels.fetch(channelId).then( channel => {
                            channel.delete() 
                        })  
                    })
                    databaseManager.deleteGroup( interaction.guild.id, group.name )
                })
            })

        }
    });
}


exports.command = new SlashCommandBuilder()
                    .setName(COMMAND_NAME)
                    .setDescription(DESCRIPTION)
                    .addSubcommand( subcommand => 
                        subcommand
                            .setName("full")
                            .setDescription("Resets everything"))
                    .addSubcommand( subcommand =>
                        subcommand
                            .setName("groups")
                            .setDescription("Resets groups only"))


exports.registerHandler = registerHandler