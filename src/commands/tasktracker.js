const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageSelectMenu, InteractionCollector } = require('discord.js');
const Utils = require('../utils.js')

const COMMAND_NAME  =   "tasktracker";
const DESCRIPTION   =   "Creates task tracker for students";

const command_temporary_memory = {}

const registerHandler = async (client) => {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;
        if ( interaction.commandName === COMMAND_NAME ) {

            if ( !(await interaction.member.permissions.has("ADMINISTRATOR", true))
                &&!(interaction.member.roles.cache.some(role => role.name ===  "Nauczyciel"))
            ) {
                interaction.reply({content: "Nie jesteś Nauczycielem!"})
                return;
            }

            const tasks = []
            for( let i = 1; i<=15; i++ ) {
                if ( interaction.options.getString(`task${i}`) != null ) {
                    tasks.push( interaction.options.getString(`task${i}`) )
                }
            }
  
        }
    });

    // handle input select interaction
    client.on('interactionCreate', async interaction => {
        if (!interaction.isSelectMenu()) return;
        if ( interaction.setCustomId != "select-poll-answer" ) return;
    })
}


exports.command = new SlashCommandBuilder()
                    .setName(COMMAND_NAME)
                    .setDescription(DESCRIPTION)
                    .addRoleOption( option =>
                        option.setName("group_name")
                            .setDescription("The name of the group (as a role)")
                            .setRequired(true)
                    )
                    .addStringOption( option =>
                        option.setName("task1")
                            .setDescription("task1")
                            .setRequired(true)
                    )
                    .addStringOption( option =>
                        option.setName("task2")
                            .setDescription("task2")
                            .setRequired(false)
                    )
                    .addStringOption( option =>
                        option.setName("task3")
                            .setDescription("task3")
                            .setRequired(false)
                    )
                    .addStringOption( option =>
                        option.setName("task4")
                            .setDescription("task4")
                            .setRequired(false)
                    )
                    .addStringOption( option =>
                        option.setName("task5")
                            .setDescription("task5")
                            .setRequired(false)
                    )
                    .addStringOption( option =>
                        option.setName("task6")
                            .setDescription("task6")
                            .setRequired(false)
                    )
                    .addStringOption( option =>
                        option.setName("task7")
                            .setDescription("task7")
                            .setRequired(false)
                    )
                    .addStringOption( option =>
                        option.setName("task8")
                            .setDescription("task8")
                            .setRequired(false)
                    )
                    .addStringOption( option =>
                        option.setName("task9")
                            .setDescription("task9")
                            .setRequired(false)
                    )
                    .addStringOption( option =>
                        option.setName("task10")
                            .setDescription("task10")
                            .setRequired(false)
                    )
                    .addStringOption( option =>
                        option.setName("task11")
                            .setDescription("task11")
                            .setRequired(false)
                    )
                    .addStringOption( option =>
                        option.setName("task12")
                            .setDescription("task12")
                            .setRequired(false)
                    )
                    .addStringOption( option =>
                        option.setName("task13")
                            .setDescription("task13")
                            .setRequired(false)

                    )
                    .addStringOption( option =>
                        option.setName("task14")
                            .setDescription("task14")
                            .setRequired(false)
                    )
                    .addStringOption( option =>
                        option.setName("task15")
                            .setDescription("task15")
                            .setRequired(false)
                    )


exports.registerHandler = registerHandler